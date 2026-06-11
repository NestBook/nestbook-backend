import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum ResourceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity('resources')
export class ResourceEntity {
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
        enum: ResourceStatus,
        default: ResourceStatus.ACTIVE,
    })
    status: ResourceStatus;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
    deletedAt: Date | null;
}