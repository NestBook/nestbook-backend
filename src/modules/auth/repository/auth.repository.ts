import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthEntity, AuthProvider } from '../entities/auth.entity';

import { CreateAuthCredentialPayload } from '../payload/create-auth-credential.payload';

import type { IAuthRepository } from './auth.repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @InjectRepository(AuthEntity)
        private readonly authOrmRepository: Repository<AuthEntity>,
    ) { }

    findAuthById(id: string): Promise<AuthEntity | null> {
        return this.authOrmRepository.findOne({
            where: {
                id,
            },
        });
    }

    findAuthByUserIdAndProvider(
        userId: string,
        provider: AuthProvider,
    ): Promise<AuthEntity | null> {
        return this.authOrmRepository.findOne({
            where: {
                userId,
                provider,
            },
        });
    }

    findLocalAuthByUserId(userId: string): Promise<AuthEntity | null> {
        return this.findAuthByUserIdAndProvider(userId, AuthProvider.LOCAL);
    }

    findProviderAuth(
        provider: AuthProvider,
        providerId: string,
    ): Promise<AuthEntity | null> {
        return this.authOrmRepository.findOne({
            where: {
                provider,
                providerId,
            },
        });
    }

    async createAuthCredential(
        payload: CreateAuthCredentialPayload,
    ): Promise<AuthEntity> {
        const authCredential = this.authOrmRepository.create({
            userId: payload.userId,
            provider: payload.provider,
            providerId: payload.providerId,
            passwordHash: payload.passwordHash,
            mfaEnabled: payload.mfaEnabled ?? false,
            mfaSecret: payload.mfaSecret ?? null,
            passwordChangedAt: payload.passwordChangedAt ?? null,
        });

        return this.authOrmRepository.save(authCredential);
    }

    async updateLastLoginAt(
        auth: AuthEntity,
        lastLoginAt: Date,
    ): Promise<AuthEntity> {
        auth.lastLoginAt = lastLoginAt;

        return this.authOrmRepository.save(auth);
    }
}