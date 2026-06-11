import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleEntity } from './entities/role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ROLE_REPOSITORY } from './repository/role.repository.interface';
import { RoleRepository } from './repository/role.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      RolePermissionEntity,
      PermissionEntity,
    ]),
  ],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
  ],
  exports: [RoleService, ROLE_REPOSITORY]
})
export class RoleModule { }
