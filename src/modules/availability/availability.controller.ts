import { Controller, Get, Query, Delete, Post, Body, Param } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateAvailabilityBlockDto } from './dto/create-availability-block.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { OkResponse } from 'src/commons/core/response/success/ok.response';
import { CreatedResponse } from 'src/commons/core/response/success/created.response';

@Controller()
export class AvailabilityController {
  constructor(
    private readonly service: AvailabilityService,
  ) { }

  @Public()
  @Get('availability/check')
  async check(@Query() dto: CheckAvailabilityDto) {
    return new OkResponse(await this.service.check({
      roomTypeId: dto.roomTypeId,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      quantity: dto.quantity,
    }));
  }

  @Post('owner/availability-blocks')
  async createBlock(
    @Body() dto: CreateAvailabilityBlockDto,
  ) {
    return new CreatedResponse(await this.service.createBlock(dto));
  }

  @Delete('owner/availability-blocks/:id')
  async removeBlock(
    @Param('id') id: string,
  ) {
    return new OkResponse(await this.service.removeBlock(id));
  }

  @Get('owner/availability')
  async ownerAvailability(
    @Query() dto: CheckAvailabilityDto,
  ) {
    return new OkResponse(await this.service.getOwnerAvailability({
      roomTypeId: dto.roomTypeId,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      quantity: dto.quantity,
    }));
  }
}
