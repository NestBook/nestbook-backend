import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { SyncRolePermissionsDto } from './dto/sync-role-permission.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.roleService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put(':roleId/permissions')
  @HttpCode(HttpStatus.OK)
  syncRolePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: SyncRolePermissionsDto,
  ) {
    return this.roleService.syncRolePermissions(roleId, dto);
  }
}