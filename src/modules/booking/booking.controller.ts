import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import { BookingService } from './booking.service';

import { BookingQuoteDto } from './dto/booking-quote.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { OkResponse } from 'src/commons/core/response/success/ok.response';
import { CreatedResponse } from 'src/commons/core/response/success/created.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Public()
  @Post('quote')
  async quote(@Body() dto: BookingQuoteDto) {
    return new OkResponse(await this.bookingService.quote(dto));
  }

  @Public()
  @Post('guest')
  async createGuest(@Body() dto: CreateBookingDto) {
    return new CreatedResponse(
      await this.bookingService.create(dto, null),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() dto: CreateBookingDto, @Req() req: any) {
    return new CreatedResponse(
      await this.bookingService.create(dto, req.user.id),
    );
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@Req() req: any) {
    return new OkResponse(
      await this.bookingService.findUserBookings(req.user.id),
    );
  }

  @Get(':bookingCode')
  async findByBookingCode(@Param('bookingCode') bookingCode: string) {
    return new OkResponse(
      await this.bookingService.findByBookingCode(bookingCode),
    );
  }

  @Patch(':bookingCode/cancel')
  async cancel(
    @Param('bookingCode') bookingCode: string,
    @Body() dto: CancelBookingDto,
  ) {
    return new OkResponse(
      await this.bookingService.cancel(bookingCode, dto),
    );
  }

  @Patch(':bookingCode/pay')
  async confirmPayment(@Param('bookingCode') bookingCode: string) {
    return new OkResponse(
      await this.bookingService.confirmPayment(bookingCode),
    );
  }
}