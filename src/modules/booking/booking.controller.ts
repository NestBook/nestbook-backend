import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingQuoteDto } from './dto/booking-quote.dto';
import { Public } from 'src/commons/decorators/public.decorator';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  @Public()
  @Post('quote')
  quote(
    @Body()
    dto: BookingQuoteDto,
  ) {
    return this.bookingService.quote(dto);
  }
}