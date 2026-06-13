import { Controller, Get, Query, Delete, Post, Body, Param } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateAvailabilityBlockDto } from './dto/create-availability-block.dto';

@Controller()
export class AvailabilityController {
  constructor(
    private readonly service: AvailabilityService,
  ) { }

  @Get('availability/check')
  check(@Query() dto: CheckAvailabilityDto) {
    return this.service.check({
      roomTypeId: dto.roomTypeId,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      quantity: dto.quantity,
    });
  }

  @Post('owner/availability-blocks')
  createBlock(
    @Body() dto: CreateAvailabilityBlockDto,
  ) {
    return this.service.createBlock(dto);
  }

  @Delete('owner/availability-blocks/:id')
  removeBlock(
    @Param('id') id: string,
  ) {
    return this.service.removeBlock(id);
  }

  @Get('owner/availability')
  ownerAvailability(
    @Query() dto: CheckAvailabilityDto,
  ) {
    return this.service.getOwnerAvailability({
      roomTypeId: dto.roomTypeId,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      quantity: dto.quantity,
    });
  }
}