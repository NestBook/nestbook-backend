import { Inject, Injectable } from '@nestjs/common';

import { BadRequestError } from 'src/commons/core/response/error/badrequest.error';
import { LoggerService } from 'src/infrastructures/logger/logger.service';

import { PermissionEntity } from './entities/permission.entity';

import { PermissionGroupResponse } from './response/permission-group.response';

import { PERMISSION_REPOSITORY } from './repository/permission.repository.interface';
import type { IPermissionRepository } from './repository/permission.repository.interface';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,

    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) { }

  async findAll(): Promise<PermissionEntity[]> {
    return this.permissionRepository.findAllPermissions();
  }

  async findGroupedByResource(): Promise<PermissionGroupResponse[]> {
    const permissions = await this.permissionRepository.findAllPermissions();

    const permissionMap = new Map<string, PermissionEntity[]>();

    for (const permission of permissions) {
      const resource = permission.resource;

      const currentPermissions = permissionMap.get(resource) ?? [];

      currentPermissions.push(permission);

      permissionMap.set(resource, currentPermissions);
    }

    return Array.from(permissionMap.entries()).map(
      ([resource, resourcePermissions]) => ({
        resource,
        permissions: resourcePermissions.map((permission) => ({
          id: String(permission.id),
          code: permission.code,
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
          status: permission.status,
        })),
      }),
    );
  }

  async validatePermissionIdsExist(permissionIds: string[]): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }

    const existingPermissionIds =
      await this.permissionRepository.findExistingPermissionIds(permissionIds);

    if (existingPermissionIds.length === permissionIds.length) {
      return;
    }

    const existingPermissionIdSet = new Set(existingPermissionIds);

    const missingPermissionIds = permissionIds.filter(
      (permissionId) => !existingPermissionIdSet.has(permissionId),
    );

    this.logger.error(
      `One or more permission IDs are invalid: ${missingPermissionIds}`,
    );

    throw new BadRequestError('One or more permission IDs are invalid', {
      missingPermissionIds,
    });
  }

  async findPermissionCodesByIds(permissionIds: string[]): Promise<string[]> {
    if (permissionIds.length === 0) {
      return [];
    }

    return this.permissionRepository.findPermissionCodesByIds(permissionIds);
  }
}