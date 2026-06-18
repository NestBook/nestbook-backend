import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum AuthProvider {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
}

@Entity('auth_credentials')
export class AuthEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true })
    userId: string;

    @Column({
        type: 'enum',
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    })
    provider: AuthProvider;

    @Column({ name: 'provider_id', type: 'varchar', length: 255, nullable: true })
    providerId: string | null;

    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
    passwordHash: string | null;

    @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
    mfaEnabled: boolean;

    @Column({ name: 'mfa_secret', type: 'varchar', length: 255, nullable: true })
    mfaSecret: string | null;

    @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
    lastLoginAt: Date | null;

    @Column({ name: 'password_changed_at', type: 'datetime', nullable: true })
    passwordChangedAt: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
    deletedAt: Date | null;
}