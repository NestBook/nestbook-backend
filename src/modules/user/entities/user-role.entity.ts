import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from '../../role/entities/role.entity';

@Entity('user_roles')
export class UserRoleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true })
    userId: string;

    @Column({ name: 'role_id', type: 'bigint', unsigned: true })
    roleId: string;

    @ManyToOne(() => UserEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => RoleEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;
}