import { Controller, Get, Param } from '@nestjs/common';
import { PublicHotelService } from './public-hotel.service';
import { Public } from 'src/commons/decorators/public.decorator';
import { OkResponse } from 'src/commons/core/response/success/ok.response';

@Controller('hotels')
export class PublicHotelController {
  constructor(private readonly service: PublicHotelService) { }

  @Public()
  @Get(':id')
  async findHotel(@Param('id') hotelId: string) {
    return new OkResponse(await this.service.getDetail(hotelId));
  }

  @Public()
  @Get(':id/room-types')
  async findRoomTypes(@Param('id') hotelId: string) {
    return new OkResponse(await this.service.getRoomTypes(hotelId));
  }
}
