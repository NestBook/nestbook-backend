import { Module } from '@nestjs/common';
import { RoomTypeModule } from '../room-type/room-type.module';
import { AvailabilityModule } from '../availability/availability.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    RoomTypeModule,
    AvailabilityModule,
  ],

  controllers: [
    BookingController,
  ],

  providers: [
    BookingService,
  ],

  exports: [
    BookingService,
  ],
})
export class BookingModule {}