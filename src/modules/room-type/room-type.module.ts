import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomTypeEntity } from './entities/room-type.entity';
import { RoomTypeController } from './room-type.controller';
import { RoomTypeService } from './room-type.service';
import { RoomTypeRepository } from './repository/room-type.repository';
import { ROOM_TYPE_REPOSITORY } from './repository/room-type.repository.interface';
import { HotelModule } from '../hotel/hotel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomTypeEntity]),
    forwardRef(() => HotelModule),
  ],
  controllers: [RoomTypeController],
  providers: [
    RoomTypeService,
    {
      provide: ROOM_TYPE_REPOSITORY,
      useClass: RoomTypeRepository,
    },
  ],
  exports: [
    RoomTypeService,
  ],
})
export class RoomTypeModule {}