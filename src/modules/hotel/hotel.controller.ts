import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { AssignHotelOwnerDto } from './dto/assign-hotel-owner.dto';
import { Permissions } from 'src/commons/decorators/permissions.decorator';

@Controller('admin/hotels')
export class HotelController {
    constructor(
        private readonly hotelService: HotelService,
    ) { }

    @Permissions('hotel.create')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateHotelDto) {
        return this.hotelService.create(dto);
    }

    @Permissions('hotel.read')
    @Get(':hotelId')
    @HttpCode(HttpStatus.OK)
    findById(@Param('hotelId') hotelId: string) {
        return this.hotelService.findById(hotelId);
    }

    @Permissions('hotel.update')
    @Patch(':hotelId')
    @HttpCode(HttpStatus.OK)
    update(@Param('hotelId') hotelId: string, @Body() dto: UpdateHotelDto) {
        return this.hotelService.update(hotelId, dto);
    }

    @Permissions('hotel.delete')
    @Delete(':hotelId')
    @HttpCode(HttpStatus.OK)
    remove(@Param('hotelId') hotelId: string) {
        return this.hotelService.remove(hotelId);
    }

    @Permissions('role.assign_permission')
    @Patch(':hotelId/owner')
    @HttpCode(HttpStatus.OK)
    assignOwner(
        @Param('hotelId')
        hotelId: string,

        @Body()
        dto: AssignHotelOwnerDto,
    ) {
        return this.hotelService.assignOwner(
            hotelId,
            dto,
        );
    }
}