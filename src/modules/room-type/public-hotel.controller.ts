import { Controller, Get, Param, Query } from '@nestjs/common';
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

  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.service.getHotelList(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.getHotelDetail(id);
  }
}