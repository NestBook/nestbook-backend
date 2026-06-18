import { Module } from '@nestjs/common';
import { RoomTypeModule } from '../room-type/room-type.module';
import { AvailabilityModule } from '../availability/availability.module';
import { InvoiceModule } from '../invoice/invoice.module';
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
import { OwnerBookingController } from '../booking/owner.booking.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    RoomTypeModule,
    AvailabilityModule,
    AuthModule,
    InvoiceModule,
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
    OwnerBookingController,
  ],

  providers: [
    BookingService,
    { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
  ],

  exports: [
    BookingService,
    BOOKING_REPOSITORY,
  ],
})
export class BookingModule { }
