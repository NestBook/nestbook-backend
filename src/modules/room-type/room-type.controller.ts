import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Controller('owner/room-types')
export class RoomTypeController {
  constructor(private readonly service: RoomTypeService) {}

  @Post()
  create(@Body() dto: CreateRoomTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  findByHotel(@Query('hotelId') hotelId: string) {
    return this.service.findByHotelId(hotelId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}