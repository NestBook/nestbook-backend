import { Inject, Injectable } from '@nestjs/common';

import { CreateRoleDto } from './dto/create-role.dto';
import { SyncRolePermissionsDto } from './dto/sync-role-permission.dto';

import { CreateRolePayload } from './payload/create-role.payload';

import { RoleEntity, RoleStatus } from './entities/role.entity';

import { ROLE_REPOSITORY } from './repository/role.repository.interface';
import type { IRoleRepository } from './repository/role.repository.interface';

import { PermissionService } from '../permission/permission.service';

import { ConflictError } from 'src/commons/core/response/error/conflict.error';
import { BadRequestError } from 'src/commons/core/response/error/badrequest.error';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { LoggerService } from 'src/infrastructures/logger/logger.service';

export interface SyncRolePermissionsResult {
  roleId: string;
  permissionIds: string[];
  addedPermissionIds: string[];
  removedPermissionIds: string[];
}

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    private readonly permissionService: PermissionService,

    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) { }

  async create(dto: CreateRoleDto): Promise<RoleEntity> {
    const existingRole = await this.roleRepository.findRoleByCode(dto.code);

    if (existingRole) {
      this.logger.log(`Role code already exists: ${dto.code}`);
      throw new ConflictError('Role code already exists');
    }

    const payload: CreateRolePayload = {
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      isSystem: false,
      status: dto.status ?? RoleStatus.ACTIVE,
    };

    return this.roleRepository.createRole(payload);
  }

  async syncRolePermissions(
    roleId: string,
    dto: SyncRolePermissionsDto,
  ): Promise<SyncRolePermissionsResult> {
    const role = await this.roleRepository.findRoleById(roleId);

    if (!role) {
      this.logger.error(`Role not found: ${roleId}`);
      throw new NotFoundError('Role not found');
    }

    const requestedPermissionIds = this.normalizeIds(dto.permissionIds);

    await this.permissionService.validatePermissionIdsExist(
      requestedPermissionIds,
    );

    const currentPermissionIds =
      await this.roleRepository.findPermissionIdsByRoleId(role.id);

    const addedPermissionIds = this.getAddedIds(
      requestedPermissionIds,
      currentPermissionIds,
    );

    const removedPermissionIds = this.getRemovedIds(
      requestedPermissionIds,
      currentPermissionIds,
    );

    await this.roleRepository.setRolePermissions(
      role.id,
      addedPermissionIds,
      removedPermissionIds,
    );

    return {
      roleId: role.id,
      permissionIds: requestedPermissionIds,
      addedPermissionIds,
      removedPermissionIds,
    };
  }

  async validateRoleIdsExist(roleIds: string[]): Promise<void> {
    if (roleIds.length === 0) {
      return;
    }

    const existingRoleIds = await this.roleRepository.findExistingRoleIds(roleIds);

    if (existingRoleIds.length === roleIds.length) {
      return;
    }

    const existingRoleIdSet = new Set(existingRoleIds);

    const missingRoleIds = roleIds.filter(
      (roleId) => !existingRoleIdSet.has(roleId),
    );

    this.logger.error(`One or more role IDs are invalid: ${missingRoleIds}`);

    throw new BadRequestError('One or more role IDs are invalid', {
      missingRoleIds,
    });
  }

  private normalizeIds(ids: string[]): string[] {
    return [...new Set(ids.map((id) => String(id)))];
  }

  private getAddedIds(requestedIds: string[], currentIds: string[]): string[] {
    const currentIdSet = new Set(currentIds);

    return requestedIds.filter((id) => !currentIdSet.has(id));
  }

  private getRemovedIds(requestedIds: string[], currentIds: string[]): string[] {
    const requestedIdSet = new Set(requestedIds);

    return currentIds.filter((id) => !requestedIdSet.has(id));
  }
}