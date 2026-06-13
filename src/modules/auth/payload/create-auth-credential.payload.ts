import { AuthProvider } from '../entities/auth.entity';

export interface CreateAuthCredentialPayload {
    userId: string;
    provider: AuthProvider;
    providerId: string | null;
    passwordHash: string | null;
    mfaEnabled?: boolean;
    mfaSecret?: string | null;
    passwordChangedAt?: Date | null;
}