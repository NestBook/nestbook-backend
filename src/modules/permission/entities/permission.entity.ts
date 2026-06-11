import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

export enum PermissionStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity('permissions')
export class PermissionEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar', length: 150 })
    code: string;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ name: 'resource_id', type: 'bigint', unsigned: true })
    resourceId: string;

    @Column({ type: 'varchar', length: 100 })
    action: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string | null;

    @Column({ name: 'is_system', type: 'boolean', default: false })
    isSystem: boolean;

    @Column({
        type: 'enum',
        enum: PermissionStatus,
        default: PermissionStatus.ACTIVE,
    })
    status: PermissionStatus;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
    deletedAt: Date | null;
}