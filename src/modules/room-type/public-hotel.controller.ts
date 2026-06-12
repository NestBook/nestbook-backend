import { Controller, Get, Param } from '@nestjs/common';
import { PublicHotelService } from './public-hotel.service';

@Controller('hotels')
export class PublicHotelController {
  constructor(private readonly service: PublicHotelService) {}

  @Get(':id/room-types')
  findRoomTypes(@Param('id') hotelId: string) {
    return this.service.getRoomTypes(hotelId);
  }
}