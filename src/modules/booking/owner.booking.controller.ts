import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { BookingService } from './booking.service';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('owner/bookings')
export class OwnerBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getOwnerBookings(@Req() req: any) {
    const ownerId = req.user.id;
    return this.bookingService.getOwnerBookings(ownerId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateBookingStatusByOwner(id, dto);
  }
}