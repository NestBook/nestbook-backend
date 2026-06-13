import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomTypeEntity } from './entities/room-type.entity';
import { PublicHotelController } from './public-hotel.controller';
import { PublicHotelService } from './public-hotel.service';
import { HotelEntity } from '../hotel/entities/hotel.entity';
import { RedisModule } from '../../infrastructures/redis/redis.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HotelEntity,
      RoomTypeEntity,
    ]),
    RedisModule,
  ],
  controllers: [PublicHotelController],
  providers: [PublicHotelService],
})
export class PublicHotelModule {}