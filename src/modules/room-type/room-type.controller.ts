import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { Permissions } from 'src/commons/decorators/permissions.decorator';

@Controller('owner/room-types')
export class RoomTypeController {
  constructor(private readonly service: RoomTypeService) { }

  @Permissions('room_type.create')
  @Post()
  create(@Body() dto: CreateRoomTypeDto) {
    return this.service.create(dto);
  }

  @Permissions('room_type.read')
  @Get()
  findByHotel(@Query('hotelId') hotelId: string) {
    return this.service.findByHotelId(hotelId);
  }

  @Permissions('room_type.read')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Permissions('room_type.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomTypeDto) {
    return this.service.update(id, dto);
  }

  @Permissions('room_type.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Permissions('room_type.update')
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadRoomTypeImage(id, file);
  }
}