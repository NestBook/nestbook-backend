import {
    Controller,
    Get,
    Patch,
    Body,
    Req,
    Param,
} from '@nestjs/common';

import { HotelService } from './hotel.service';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Permissions } from 'src/commons/decorators/permissions.decorator';

@Controller('owner/hotels')
export class OwnerHotelController {
    constructor(private readonly hotelService: HotelService) {}

    @Permissions('hotel.read')
    @Get()
    getMyHotels(@Req() req: any) {
        const ownerId = req.user.id;
        return this.hotelService.findByOwnerId(ownerId);
    }

    @Permissions('hotel.read')
    @Get(':hotelId')
    getMyHotelDetail(
        @Req() req: any,
        @Param('hotelId') hotelId: string,
    ) {
        return this.hotelService.findOwnedHotelById(req.user.id, hotelId);
    }

    @Permissions('hotel.update')
    @Patch(':hotelId')
    updateMyHotel(
        @Req() req: any,
        @Param('hotelId') hotelId: string,
        @Body() dto: UpdateHotelDto,
    ) {
        return this.hotelService.updateOwnedHotel(
            req.user.id,
            hotelId,
            dto,
        );
    }
}