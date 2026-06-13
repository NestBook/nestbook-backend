import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_roles')
export class UserRoleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true })
    userId: string;

    @Column({ name: 'role_id', type: 'bigint', unsigned: true })
    roleId: string;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;
}