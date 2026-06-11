import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum RoleStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity('roles')
export class RoleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar', length: 100 })
    code: string;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string | null;

    @Column({ name: 'is_system', type: 'boolean', default: false })
    isSystem: boolean;

    @Column({
        type: 'enum',
        enum: RoleStatus,
        default: RoleStatus.ACTIVE,
    })
    status: RoleStatus;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
    deletedAt: Date | null;
}