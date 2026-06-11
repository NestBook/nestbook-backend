import {
  Inject,
  Injectable,
} from '@nestjs/common';

import { CreateRolePayload } from './payload/create-role.payload';
import { RoleEntity, RoleStatus } from './entities/role.entity';
import type {
  IRoleRepository,
} from './repository/role.repository.interface';
import { ROLE_REPOSITORY } from './repository/role.repository.interface';
import { CreateRoleDto } from './dto/create-role.dto';
import { SyncRolePermissionsDto } from './dto/sync-role-permission.dto';
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
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) { }

  async create(dto: CreateRoleDto): Promise<RoleEntity> {
    const existingRole = await this.roleRepository.findRoleByCode(dto.code);

    if (existingRole) {
      this.logger.log('Role code already exists');
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
      console.log(`Role not found: ${roleId}`);
      this.logger.error(`Role not found: ${roleId}`);
      throw new NotFoundError('Role not found');
    }

    const requestedPermissionIds = [
      ...new Set(dto.permissionIds.map((permissionId) => String(permissionId))),
    ];

    await this.validatePermissionIdsExist(requestedPermissionIds);

    const currentPermissionIds =
      await this.roleRepository.findPermissionIdsByRoleId(role.id);

    const requestedPermissionIdSet = new Set(requestedPermissionIds);
    const currentPermissionIdSet = new Set(currentPermissionIds);

    const addedPermissionIds = requestedPermissionIds.filter(
      (permissionId) => !currentPermissionIdSet.has(permissionId),
    );

    const removedPermissionIds = currentPermissionIds.filter(
      (permissionId) => !requestedPermissionIdSet.has(permissionId),
    );

    await this.roleRepository.createRolePermissions(
      role.id,
      addedPermissionIds,
    );

    await this.roleRepository.deleteRolePermissions(
      role.id,
      removedPermissionIds,
    );

    return {
      roleId: role.id,
      permissionIds: requestedPermissionIds,
      addedPermissionIds,
      removedPermissionIds,
    };
  } // let checking again

  private async validatePermissionIdsExist(
    permissionIds: string[],
  ): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }

    const existingPermissionIds =
      await this.roleRepository.findExistingPermissionIds(permissionIds);

    if (existingPermissionIds.length === permissionIds.length) {
      return;
    }

    const existingPermissionIdSet = new Set(existingPermissionIds);

    const missingPermissionIds = permissionIds.filter(
      (permissionId) => !existingPermissionIdSet.has(permissionId),
    );
    console.log(`one or more permission IDs are invalid`)
    this.logger.error(`One or more permission IDs are invalid: ${missingPermissionIds}`);
    throw new BadRequestError('One or more permission IDs are invalid', {
      missingPermissionIds,
    })
  }
}