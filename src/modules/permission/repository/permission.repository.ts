import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PermissionEntity } from '../entities/permission.entity';
import type { IPermissionRepository } from './permission.repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionOrmRepository: Repository<PermissionEntity>,
    ) { }

    findPermissionById(id: string): Promise<PermissionEntity | null> {
        return this.permissionOrmRepository.findOne({
            where: {
                id,
            },
        });
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

    async findPermissionCodesByIds(permissionIds: string[]): Promise<string[]> {
        if (permissionIds.length === 0) {
            return [];
        }

        const permissions = await this.permissionOrmRepository.find({
            select: {
                code: true,
            },
            where: {
                id: In(permissionIds),
            },
        });

        return [
            ...new Set(
                permissions.map((permission) => permission.code),
            ),
        ];
    }
}