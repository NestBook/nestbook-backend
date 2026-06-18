import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AdminMfaVerifyDto } from './dto/admin-mfa-verify.dto';
import { ProviderLoginDto } from './dto/providers-login.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { CreatedResponse } from 'src/commons/core/response/success/created.response';
import { OkResponse } from 'src/commons/core/response/success/ok.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return new CreatedResponse(await this.authService.register(dto));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return new OkResponse(await this.authService.login(dto));
  }

  @Public()
  @Post('admin/mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyAdminMfa(@Body() dto: AdminMfaVerifyDto) {
    return new OkResponse(await this.authService.verifyAdminMfa(dto));
  }

  @Public()
  @Post('provider-login')
  @HttpCode(HttpStatus.OK)
  async providerLogin(@Body() dto: ProviderLoginDto) {
    return new OkResponse(await this.authService.providerLogin(dto));
  }

  @Public()
  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: ProviderLoginDto) {
    console.log({ dto })
    return new OkResponse(await this.authService.providerLogin(dto));
  }

  @Public()
  @Get('google')
  @Redirect('', HttpStatus.FOUND)
  googleLoginStart() {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      redirect_uri: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  @Public()
  @Get('google/callback')
  @HttpCode(HttpStatus.OK)
  googleCallback(@Query('code') code: string) {
    return new OkResponse({
      message: 'Google OAuth callback is not implemented yet',
      code
    });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  me() {
    return new OkResponse({
      message: 'Auth me is not implemented yet. Need JwtAuthGuard first.',
    });
  }
}
