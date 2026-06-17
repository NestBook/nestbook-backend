import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { BookingService } from './booking.service';

import { BookingQuoteDto } from './dto/booking-quote.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { OkResponse } from 'src/commons/core/response/success/ok.response';
import { CreatedResponse } from 'src/commons/core/response/success/created.response';

@Public()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post('quote')
  async quote(@Body() dto: BookingQuoteDto) {
    return new OkResponse(await this.bookingService.quote(dto));
  }

  @Post()
  async create(@Body() dto: CreateBookingDto) {
    return new CreatedResponse(await this.bookingService.create(dto));
  }

  @Get(':bookingCode')
  async findByBookingCode(@Param('bookingCode') bookingCode: string) {
    return new OkResponse(await this.bookingService.findByBookingCode(bookingCode));
  }

  @Patch(':bookingCode/cancel')
  async cancel(
    @Param('bookingCode') bookingCode: string,
    @Body() dto: CancelBookingDto,
  ) {
    return new OkResponse(await this.bookingService.cancel(bookingCode, dto));
  }

  @Patch(':bookingCode/pay')
  async confirmPayment(@Param('bookingCode') bookingCode: string) {
    return new OkResponse(await this.bookingService.confirmPayment(bookingCode));
  }
}
