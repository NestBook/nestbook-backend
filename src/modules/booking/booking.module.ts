import { Module } from '@nestjs/common';
import { RoomTypeModule } from '../room-type/room-type.module';
import { AvailabilityModule } from '../availability/availability.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entity/booking.entity';
import { BOOKING_REPOSITORY } from './repository/booking.repository.interface';
import { BookingRepository } from './repository/booking.repository';
import { LoggerModule } from 'src/infrastructures/logger/logger.module';
import { RedisModule } from 'src/infrastructures/redis/redis.module';
import { HotelEntity } from '../hotel/entities/hotel.entity';
import { RoomTypeEntity } from '../room-type/entities/room-type.entity';
@Module({
  imports: [
    RoomTypeModule,
    AvailabilityModule,
    RedisModule,
    LoggerModule,
    TypeOrmModule.forFeature([
      BookingEntity,
      HotelEntity,
      RoomTypeEntity,
    ]),
  ],

  controllers: [
    BookingController,
  ],

  providers: [
    BookingService,
    { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
  ],

  exports: [
    BookingService,
  ],
})
export class BookingModule { }
