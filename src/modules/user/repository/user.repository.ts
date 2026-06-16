import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { UserRoleEntity } from '../entities/user-role.entity';

import { CreateUserPayload } from '../payload/create-user.payload';
import { UpdateUserPayload } from '../payload/update-user.payload';
import type { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userOrmRepository: Repository<UserEntity>,

        @InjectRepository(UserRoleEntity)
        private readonly userRoleOrmRepository: Repository<UserRoleEntity>,

        private readonly dataSource: DataSource,
    ) { }

    findUserById(id: string): Promise<UserEntity | null> {
        return this.userOrmRepository.findOne({
            where: { id },
        });
    }

    findUserByEmail(
        email: string,
        options?: {
            withDeleted?: boolean;
        },
    ): Promise<UserEntity | null> {
        return this.userOrmRepository.findOne({
            where: { email },
            withDeleted: options?.withDeleted ?? false,
        });
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userOrmRepository.find();
    }

    async createUser(payload: CreateUserPayload): Promise<UserEntity> {
        const user = this.userOrmRepository.create({
            email: payload.email,
            fullName: payload.fullName,
            phone: payload.phone,
            status: payload.status,
        });

        return this.userOrmRepository.save(user);
    }

    async updateUser(
        user: UserEntity,
        payload: UpdateUserPayload,
    ): Promise<UserEntity> {
        Object.assign(user, {
            email: payload.email ?? user.email,
            fullName: payload.fullName ?? user.fullName,
            phone: payload.phone === undefined ? user.phone : payload.phone,
            status: payload.status ?? user.status,
        });

        return this.userOrmRepository.save(user);
    }

    async softDeleteUser(id: string): Promise<void> {
        await this.userOrmRepository.softDelete(id);
    }

    async findRoleIdsByUserId(userId: string): Promise<string[]> {
        const userRoles = await this.userRoleOrmRepository.find({
            select: {
                roleId: true,
            },
            where: {
                userId,
            },
        });

        return userRoles.map((userRole) => String(userRole.roleId));
    }


    async setUserRoles(
        userId: string,
        addedRoleIds: string[],
        removedRoleIds: string[],
    ): Promise<void> {
        if (addedRoleIds.length === 0 && removedRoleIds.length === 0) {
            return;
        }

        await this.dataSource.transaction(async (manager) => {
            if (removedRoleIds.length > 0) {
                await manager.delete(UserRoleEntity, {
                    userId,
                    roleId: In(removedRoleIds),
                });
            }

            if (addedRoleIds.length > 0) {
                const userRoles = addedRoleIds.map((roleId) =>
                    manager.create(UserRoleEntity, {
                        userId,
                        roleId,
                    }),
                );

                await manager.save(UserRoleEntity, userRoles);
            }
        });
    }
}

