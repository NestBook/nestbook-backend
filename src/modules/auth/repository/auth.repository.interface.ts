import { AuthEntity, AuthProvider } from '../entities/auth.entity';
import { CreateAuthCredentialPayload } from '../payload/create-auth-credential.payload';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface IAuthRepository {
    findAuthById(id: string): Promise<AuthEntity | null>;

    findAuthByUserIdAndProvider(
        userId: string,
        provider: AuthProvider,
    ): Promise<AuthEntity | null>;

    findLocalAuthByUserId(userId: string): Promise<AuthEntity | null>;

    findProviderAuth(
        provider: AuthProvider,
        providerId: string,
    ): Promise<AuthEntity | null>;

    createAuthCredential(
        payload: CreateAuthCredentialPayload,
    ): Promise<AuthEntity>;

    updateLastLoginAt(auth: AuthEntity, lastLoginAt: Date): Promise<AuthEntity>;
}