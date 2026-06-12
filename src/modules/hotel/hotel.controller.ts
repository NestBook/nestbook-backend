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

@Controller('admin/hotels')
export class HotelController {
    constructor(
        private readonly hotelService: HotelService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body() dto: CreateHotelDto,
    ) {
        return this.hotelService.create(dto);
    }

    @Get(':hotelId')
    @HttpCode(HttpStatus.OK)
    findById(
        @Param('hotelId')
        hotelId: string,
    ) {
        return this.hotelService.findById(
            hotelId,
        );
    }

    @Patch(':hotelId')
    @HttpCode(HttpStatus.OK)
    update(
        @Param('hotelId')
        hotelId: string,

        @Body()
        dto: UpdateHotelDto,
    ) {
        return this.hotelService.update(
            hotelId,
            dto,
        );
    }

    @Delete(':hotelId')
    @HttpCode(HttpStatus.OK)
    remove(
        @Param('hotelId')
        hotelId: string,
    ) {
        return this.hotelService.remove(
            hotelId,
        );
    }

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