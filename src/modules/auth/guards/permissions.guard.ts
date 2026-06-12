// src/modules/auth/guards/permissions.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../../commons/decorators/public.decorator';
import { PERMISSIONS_KEY } from '../../../commons/decorators/permissions.decorator';

import { ForbiddenError } from '../../../commons/core/response/error/forbidden.error';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenError('User not authenticated');
    }

    const hasPermission = await this.userService.hasPermissions(
      user.id,
      requiredPermissions,
    );

    if (!hasPermission) {
      throw new ForbiddenError('You do not have permission');
    }

    return true;
  }
}