import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PERMISSION_REPOSITORY } from './repository/permission.repository.interface';
import { PermissionRepository } from './repository/permission.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
    ])
  ],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PermissionRepository,
    },
  ],
  exports: [PermissionService],
})
export class PermissionModule { }
