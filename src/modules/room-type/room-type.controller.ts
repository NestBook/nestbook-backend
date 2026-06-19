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

import { OkResponse } from 'src/commons/core/response/success/ok.response';
import { CreatedResponse } from 'src/commons/core/response/success/created.response';

@Controller('owner/room-types')
export class RoomTypeController {
  constructor(private readonly service: RoomTypeService) {}

  @Permissions('room_type.create')
  @Post()
  async create(@Body() dto: CreateRoomTypeDto) {
    return new CreatedResponse(await this.service.create(dto));
  }

  @Permissions('room_type.read')
  @Get()
  async findByHotel(@Query('hotelId') hotelId: string) {
    return new OkResponse(await this.service.findByHotelId(hotelId));
  }

  @Permissions('room_type.read')
  @Get(':id')
  async findById(@Param('id') id: string) {
    return new OkResponse(await this.service.findById(id));
  }

  @Permissions('room_type.update')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoomTypeDto) {
    return new OkResponse(await this.service.update(id, dto));
  }

  @Permissions('room_type.delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return new OkResponse(await this.service.remove(id));
  }

  @Permissions('room_type.update')
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return new OkResponse(await this.service.uploadRoomTypeImage(id, file));
  }
}