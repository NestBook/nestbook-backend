import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from '../../permission/entities/permission.entity';

@Entity('role_permissions')
export class RolePermissionEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ name: 'role_id', type: 'bigint', unsigned: true })
    roleId: string;

    @Column({ name: 'permission_id', type: 'bigint', unsigned: true })
    permissionId: string;

    @ManyToOne(() => RoleEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @ManyToOne(() => PermissionEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'permission_id' })
    permission: PermissionEntity;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

}