import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { RoleEntity } from '../entities/role.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { PermissionEntity } from '../../permission/entities/permission.entity';

import { CreateRolePayload } from '../payload/create-role.payload';
import { IRoleRepository } from './role.repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleOrmRepository: Repository<RoleEntity>,

        @InjectRepository(RolePermissionEntity)
        private readonly rolePermissionOrmRepository: Repository<RolePermissionEntity>,

        @InjectRepository(PermissionEntity)
        private readonly permissionOrmRepository: Repository<PermissionEntity>,
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
                code
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

    async findExistingPermissionIds(permissionIds: string[]): Promise<string[]> {
        if (permissionIds.length === 0) {
            return [];
        }

        const permissions = await this.permissionOrmRepository.find({
            select: {
                id: true,
            },
            where: {
                id: In(permissionIds),
            },
        });

        return permissions.map((permission) => String(permission.id));
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

    async createRolePermissions(
        roleId: string,
        permissionIds: string[],
    ): Promise<void> {
        if (permissionIds.length === 0) {
            return;
        }

        const rolePermissions = permissionIds.map((permissionId) =>
            this.rolePermissionOrmRepository.create({
                roleId,
                permissionId,
            }),
        );

        await this.rolePermissionOrmRepository.save(rolePermissions);
    }

    async deleteRolePermissions(
        roleId: string,
        permissionIds: string[],
    ): Promise<void> {
        if (permissionIds.length === 0) {
            return;
        }

        await this.rolePermissionOrmRepository.delete({
            roleId,
            permissionId: In(permissionIds),
        });
    }
}