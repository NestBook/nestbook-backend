import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicHotelService } from './public-hotel.service';
import { Public } from 'src/commons/decorators/public.decorator';

import { OkResponse } from 'src/commons/core/response/success/ok.response';

@Public()
@Controller('hotels')
export class PublicHotelController {
  constructor(private readonly service: PublicHotelService) {}

  @Get(':id/room-types')
  async findRoomTypes(@Param('id') hotelId: string) {
    return new OkResponse(await this.service.getRoomTypes(hotelId));
  }
  
  @Get()
  async findAll(@Query() query: any) {
    return new OkResponse(await this.service.getHotelList(query));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return new OkResponse(await this.service.getHotelDetail(id));
  }
}