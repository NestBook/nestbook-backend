import { Controller, Get, Param } from '@nestjs/common';
import { PublicHotelService } from './public-hotel.service';
import { Public } from 'src/commons/decorators/public.decorator';

@Controller('hotels')
export class PublicHotelController {
  constructor(private readonly service: PublicHotelService) { }

  @Public()
  @Get(':id/room-types')
  findRoomTypes(@Param('id') hotelId: string) {
    return this.service.getRoomTypes(hotelId);
  }
}