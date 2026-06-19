import { IsEnum } from 'class-validator';
import { BookingStatus } from '../entity/booking.entity';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  bookingStatus!: BookingStatus;
}