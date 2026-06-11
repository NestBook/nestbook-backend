import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED',
}

export enum AuthProvider {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
}

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
    passwordHash: string | null;

    @Column({ name: 'full_name', type: 'varchar', length: 150 })
    fullName: string;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @Column({
        type: 'enum',
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    })
    provider: AuthProvider;

    @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true })
    googleId: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone: string | null;

    @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
    mfaEnabled: boolean;

    @Column({ name: 'mfa_secret', type: 'varchar', length: 255, nullable: true })
    mfaSecret: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
    deletedAt: Date | null;
}