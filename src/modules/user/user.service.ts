import { Inject, Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetUserRoleDto } from './dto/set-user-role.dto';

import { UserEntity, UserStatus } from './entities/user.entity';

import { USER_REPOSITORY } from './repository/user.repository.interface';
import type { IUserRepository } from './repository/user.repository.interface';

import { SetUserRoleResult } from './response/set-user-role.response';
import { UserAccessResponse } from './response/user-access.response';

import { RoleService } from '../role/role.service';

import { ConflictError } from 'src/commons/core/response/error/conflict.error';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { LoggerService } from 'src/infrastructures/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    private readonly roleService: RoleService,

    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) { }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    await this.validateEmailNotExists(dto.email);

    return this.userRepository.createUser({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      status: dto.status ?? UserStatus.ACTIVE,
    });
  }

  async findById(userId: string): Promise<UserEntity> {
    return this.getUserOrThrow(userId);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async findByIdWithAccess(userId: string): Promise<UserAccessResponse> {
    const user = await this.getUserOrThrow(userId);

    return this.mapUserToAccessResponse(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  async hasPermissions(
    userId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const user = await this.getUserOrThrow(userId);

    const roleIds = await this.userRepository.findRoleIdsByUserId(user.id);

    if (!roleIds || roleIds.length === 0) {
      return false;
    }

    const access = await this.roleService.getAccessByRoleIds(roleIds);

    const userPermissions = access.permissions ?? [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }

  async findByEmailWithAccess(
    email: string,
  ): Promise<UserAccessResponse | null> {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      return null;
    }

    return this.mapUserToAccessResponse(user);
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getUserOrThrow(userId);

    if (dto.email && dto.email !== user.email) {
      await this.validateEmailNotExists(dto.email);
    }

    return this.userRepository.updateUser(user, {
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone,
      status: dto.status,
    });
  }

  async remove(userId: string): Promise<{ deleted: true }> {
    const user = await this.getUserOrThrow(userId);

    await this.userRepository.softDeleteUser(user.id);

    return { deleted: true };
  }

  async setUserRoles(
    userId: string,
    dto: SetUserRoleDto,
  ): Promise<SetUserRoleResult> {
    const user = await this.getUserOrThrow(userId);

    const requestedRoleIds = this.normalizeIds(dto.roleIds);

    await this.roleService.validateRoleIdsExist(requestedRoleIds);

    const currentRoleIds = await this.userRepository.findRoleIdsByUserId(user.id);

    const addedRoleIds = this.getAddedIds(requestedRoleIds, currentRoleIds);

    const removedRoleIds = this.getRemovedIds(requestedRoleIds, currentRoleIds);

    await this.userRepository.setUserRoles(
      user.id,
      addedRoleIds,
      removedRoleIds,
    );

    return {
      userId: user.id,
      roleIds: requestedRoleIds,
      addedRoleIds,
      removedRoleIds,
    };
  }

  private async getUserOrThrow(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      this.logger.error(`User not found: ${userId}`);
      throw new NotFoundError('User not found');
    }

    return user;
  }

  private async validateEmailNotExists(email: string): Promise<void> {
    const existingUser = await this.userRepository.findUserByEmail(email, {
      withDeleted: true,
    });

    if (existingUser) {
      this.logger.log(`Email already exists: ${email}`);
      throw new ConflictError('Email already exists');
    }
  }

  private async mapUserToAccessResponse(
    user: UserEntity,
  ): Promise<UserAccessResponse> {
    const roleIds = await this.userRepository.findRoleIdsByUserId(user.id);

    const access = await this.roleService.getAccessByRoleIds(roleIds);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      status: user.status,
      roles: access.roles,
      permissions: access.permissions,
    };
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