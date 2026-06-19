import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminSeeder } from './admin.seed';
import { HotelSeeder } from './hotel.seed';

import { UserEntity } from '../../modules/user/entities/user.entity';
import { UserRoleEntity } from '../../modules/user/entities/user-role.entity';
import { AuthEntity } from '../../modules/auth/entities/auth.entity';
import { RoleEntity } from '../../modules/role/entities/role.entity';
import { HotelEntity } from '../../modules/hotel/entities/hotel.entity';
import { RoomTypeEntity } from '../../modules/room-type/entities/room-type.entity';
import { LoggerModule } from '../../infrastructures/logger/logger.module';

@Module({
    imports: [
        LoggerModule,
        TypeOrmModule.forFeature([
            UserEntity,
            UserRoleEntity,
            AuthEntity,
            RoleEntity,
            HotelEntity,
            RoomTypeEntity,
        ]),
    ],
    providers: [AdminSeeder, HotelSeeder],
})
export class SeedModule {}
