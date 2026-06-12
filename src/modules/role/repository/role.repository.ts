import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { RoleEntity } from '../entities/role.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';

import { CreateRolePayload } from '../payload/create-role.payload';
import type { IRoleRepository } from './role.repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleOrmRepository: Repository<RoleEntity>,

        @InjectRepository(RolePermissionEntity)
        private readonly rolePermissionOrmRepository: Repository<RolePermissionEntity>,

        private readonly dataSource: DataSource,
    ) { }

    findRoleById(id: string): Promise<RoleEntity | null> {
        return this.roleOrmRepository.findOne({
            where: {
                id,
            },
        });
    }

    findRoleByCode(code: string): Promise<RoleEntity | null> {
        return this.roleOrmRepository.findOne({
            where: {
                code,
            },
        });
    }

    async createRole(payload: CreateRolePayload): Promise<RoleEntity> {
        const role = this.roleOrmRepository.create({
            code: payload.code,
            name: payload.name,
            description: payload.description,
            isSystem: payload.isSystem,
            status: payload.status,
        });

        return this.roleOrmRepository.save(role);
    }

    async findExistingRoleIds(roleIds: string[]): Promise<string[]> {
        if (roleIds.length === 0) {
            return [];
        }

        const roles = await this.roleOrmRepository.find({
            select: {
                id: true,
            },
            where: {
                id: In(roleIds),
            },
        });

        return roles.map((role) => String(role.id));
    }

    async findPermissionIdsByRoleId(roleId: string): Promise<string[]> {
        const rolePermissions = await this.rolePermissionOrmRepository.find({
            select: {
                permissionId: true,
            },
            where: {
                roleId,
            },
        });

        return rolePermissions.map((rolePermission) =>
            String(rolePermission.permissionId),
        );
    }

    async setRolePermissions(
        roleId: string,
        addedPermissionIds: string[],
        removedPermissionIds: string[],
    ): Promise<void> {
        if (addedPermissionIds.length === 0 && removedPermissionIds.length === 0) {
            return;
        }

        await this.dataSource.transaction(async (manager) => {
            if (removedPermissionIds.length > 0) {
                await manager.delete(RolePermissionEntity, {
                    roleId,
                    permissionId: In(removedPermissionIds),
                });
            }

            if (addedPermissionIds.length > 0) {
                const rolePermissions = addedPermissionIds.map((permissionId) =>
                    manager.create(RolePermissionEntity, {
                        roleId,
                        permissionId,
                    }),
                );

                await manager.save(RolePermissionEntity, rolePermissions);
            }
        });
    }
}