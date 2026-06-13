import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { PermissionService } from './permission.service';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.permissionService.findAll();
  }

  @Get('grouped-by-resource')
  @HttpCode(HttpStatus.OK)
  findGroupedByResource() {
    return this.permissionService.findGroupedByResource();
  }
}