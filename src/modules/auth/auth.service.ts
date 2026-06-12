import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import * as speakeasy from 'speakeasy';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ProviderLoginDto } from './dto/providers-login.dto';
import { AdminMfaVerifyDto } from './dto/admin-mfa-verify.dto';

import { AuthProvider } from './entities/auth.entity';

import { AUTH_REPOSITORY } from './repository/auth.repository.interface';
import type { IAuthRepository } from './repository/auth.repository.interface';

import {
  AuthMfaRequiredResponse,
  AuthResponse,
  AuthSuccessResponse,
  AuthUserResponse,
} from './response/auth.response';

import { UserStatus } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

import { BadRequestError } from 'src/commons/core/response/error/badrequest.error';
import { ConflictError } from 'src/commons/core/response/error/conflict.error';
import { LoggerService } from 'src/infrastructures/logger/logger.service';

interface VerifiedProviderProfile {
  provider: AuthProvider;
  providerId: string;
  email: string;
  fullName: string;
}

interface MfaTokenPayload {
  sub: string;
  authId: string;
  purpose: 'ADMIN_MFA';
}

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,

    private readonly userService: UserService,

    private readonly jwtService: JwtService,

    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) { }

  async register(dto: RegisterDto): Promise<AuthSuccessResponse> {
    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.userService.create({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
    });

    console.log("user", user)

    const authCredential = await this.authRepository.createAuthCredential({
      userId: user.id,
      provider: AuthProvider.LOCAL,
      providerId: null,
      passwordHash,
      mfaEnabled: false,
      mfaSecret: null,
      passwordChangedAt: new Date(),
    });

    console.log("authCredential", authCredential)

    await this.authRepository.updateLastLoginAt(authCredential, new Date());

    const userWithAccess = await this.userService.findByIdWithAccess(user.id);

    console.log("userWithAccess", userWithAccess)

    return this.buildAuthSuccessResponse(userWithAccess);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmailWithAccess(dto.email);

    if (!user) {
      this.logger.log(`Login failed. Email not found: ${dto.email}`);
      throw new BadRequestError('Invalid email or password');
    }

    this.validateUserCanLogin(user);

    const authCredential = await this.authRepository.findLocalAuthByUserId(
      user.id,
    );

    if (!authCredential || !authCredential.passwordHash) {
      this.logger.log(`Login failed. Local credential not found: ${dto.email}`);
      throw new BadRequestError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      authCredential.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.log(`Login failed. Invalid password: ${dto.email}`);
      throw new BadRequestError('Invalid email or password');
    }

    if (authCredential.mfaEnabled) {
      if (!authCredential.mfaSecret) {
        this.logger.error(`MFA enabled but secret missing: ${dto.email}`);
        throw new BadRequestError('MFA is not configured correctly');
      }

      return this.buildMfaRequiredResponse(user.id, authCredential.id);
    }

    await this.authRepository.updateLastLoginAt(authCredential, new Date());

    return this.buildAuthSuccessResponse(user);
  }

  async verifyAdminMfa(
    dto: AdminMfaVerifyDto,
  ): Promise<AuthSuccessResponse> {
    const payload = await this.verifyMfaToken(dto.mfaToken);

    const authCredential = await this.authRepository.findAuthById(
      payload.authId,
    );

    if (!authCredential) {
      this.logger.error(`MFA auth credential not found: ${payload.authId}`);
      throw new BadRequestError('Invalid MFA token');
    }

    if (authCredential.userId !== payload.sub) {
      this.logger.error(`MFA token user mismatch: ${payload.sub}`);
      throw new BadRequestError('Invalid MFA token');
    }

    if (!authCredential.mfaEnabled || !authCredential.mfaSecret) {
      this.logger.error(`MFA is not enabled for auth: ${authCredential.id}`);
      throw new BadRequestError('MFA is not enabled');
    }

    const isValidCode = speakeasy.totp.verify({
      secret: authCredential.mfaSecret,
      encoding: 'base32',
      token: dto.code,
      window: 1,
    });

    if (!isValidCode) {
      this.logger.log(`Invalid MFA code for user: ${authCredential.userId}`);
      throw new BadRequestError('Invalid MFA code');
    }

    const user = await this.userService.findByIdWithAccess(
      authCredential.userId,
    );

    this.validateUserCanLogin(user);

    await this.authRepository.updateLastLoginAt(authCredential, new Date());

    return this.buildAuthSuccessResponse(user);
  }

  async providerLogin(dto: ProviderLoginDto): Promise<AuthSuccessResponse> {
    const providerProfile = await this.verifyProviderToken(dto);

    let authCredential = await this.authRepository.findProviderAuth(
      providerProfile.provider,
      providerProfile.providerId,
    );

    if (authCredential) {
      const user = await this.userService.findByIdWithAccess(
        authCredential.userId,
      );

      this.validateUserCanLogin(user);

      await this.authRepository.updateLastLoginAt(authCredential, new Date());

      return this.buildAuthSuccessResponse(user);
    }

    let user = await this.userService.findByEmailWithAccess(
      providerProfile.email,
    );

    if (user) {
      this.validateUserCanLogin(user);

      const existingProviderAuth =
        await this.authRepository.findAuthByUserIdAndProvider(
          user.id,
          providerProfile.provider,
        );

      if (existingProviderAuth) {
        throw new ConflictError('Provider already linked to this user');
      }
    } else {
      const createdUser = await this.userService.create({
        email: providerProfile.email,
        fullName: providerProfile.fullName,
        phone: null,
      });

      user = await this.userService.findByIdWithAccess(createdUser.id);
    }

    authCredential = await this.authRepository.createAuthCredential({
      userId: user.id,
      provider: providerProfile.provider,
      providerId: providerProfile.providerId,
      passwordHash: null,
      mfaEnabled: false,
      mfaSecret: null,
      passwordChangedAt: null,
    });

    await this.authRepository.updateLastLoginAt(authCredential, new Date());

    return this.buildAuthSuccessResponse(user);
  }

  private async verifyProviderToken(
    dto: ProviderLoginDto,
  ): Promise<VerifiedProviderProfile> {
    switch (dto.provider) {
      case AuthProvider.GOOGLE:
        return this.verifyGoogleToken(dto.providerToken);

      default:
        throw new BadRequestError('Unsupported auth provider');
    }
  }

  private async verifyGoogleToken(
    providerToken: string,
  ): Promise<VerifiedProviderProfile> {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      this.logger.error('GOOGLE_CLIENT_ID is not configured');
      throw new BadRequestError('Google login is not configured');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: providerToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email) {
        throw new BadRequestError('Invalid Google token');
      }

      if (payload.email_verified === false) {
        throw new BadRequestError('Google email is not verified');
      }

      return {
        provider: AuthProvider.GOOGLE,
        providerId: payload.sub,
        email: payload.email,
        fullName: payload.name ?? payload.email,
      };
    } catch (error) {
      this.logger.error(`Google token verification failed: ${String(error)}`);
      throw new BadRequestError('Invalid provider token');
    }
  }

  private async buildAuthSuccessResponse(
    user: AuthUserResponse,
  ): Promise<AuthSuccessResponse> {
    const accessToken = await this.signAccessToken(user);

    console.log({ accessToken })

    return {
      accessToken,
      user,
      requiresMfa: false,
    };
  }

  private async buildMfaRequiredResponse(
    userId: string,
    authId: string,
  ): Promise<AuthMfaRequiredResponse> {
    const mfaToken = await this.signMfaToken(userId, authId);

    return {
      mfaToken,
      requiresMfa: true,
    };
  }

  private async signAccessToken(user: AuthUserResponse): Promise<string> {
    try {
      console.log('Signing access token for user:', {
        id: user.id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
      });

      const token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        roles: user.roles?.map((role) => role.code) ?? [],
        permissions: user.permissions ?? [],
      });

      console.log('Access token generated');

      return token;
    } catch (error) {
      this.logger.error(`Failed to sign access token: ${String(error)}`);
      console.error(error);

      throw error;
    }
  }

  private async signMfaToken(
    userId: string,
    authId: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        authId,
        purpose: 'ADMIN_MFA',
      },
      {
        expiresIn: '5m',
      },
    );
  }

  private async verifyMfaToken(mfaToken: string): Promise<MfaTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<MfaTokenPayload>(
        mfaToken,
      );

      if (payload.purpose !== 'ADMIN_MFA') {
        throw new BadRequestError('Invalid MFA token');
      }

      return payload;
    } catch (error) {
      this.logger.log(`Invalid or expired MFA token: ${String(error)}`);
      throw new BadRequestError('Invalid or expired MFA token');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;

    return bcrypt.hash(password, saltRounds);
  }

  private validateUserCanLogin(user: AuthUserResponse): void {
    if (user.status !== UserStatus.ACTIVE) {
      this.logger.log(`Login blocked. User is not active: ${user.email}`);
      throw new BadRequestError('User is not active');
    }
  }
}