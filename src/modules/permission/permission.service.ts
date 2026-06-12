import { Inject, Injectable } from '@nestjs/common';

import { BadRequestError } from 'src/commons/core/response/error/badrequest.error';
import { LoggerService } from 'src/infrastructures/logger/logger.service';

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