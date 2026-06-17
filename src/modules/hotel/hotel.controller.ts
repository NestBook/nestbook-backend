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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { AssignHotelOwnerDto } from './dto/assign-hotel-owner.dto';
import { Permissions } from 'src/commons/decorators/permissions.decorator';
import { CreatedResponse } from 'src/commons/core/response/success/created.response';
import { OkResponse } from 'src/commons/core/response/success/ok.response';

@Controller('admin/hotels')
export class HotelController {
    constructor(
        private readonly hotelService: HotelService,
    ) { }

    @Permissions('hotel.create')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateHotelDto) {
        return new CreatedResponse(await this.hotelService.create(dto));
    }

    @Permissions('hotel.read')
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return new OkResponse(await this.hotelService.findAll());
    }

    @Permissions('hotel.read')
    @Get(':hotelId')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('hotelId') hotelId: string) {
        return new OkResponse(await this.hotelService.findById(hotelId));
    }

    @Permissions('hotel.update')
    @Patch(':hotelId')
    @HttpCode(HttpStatus.OK)
    async update(@Param('hotelId') hotelId: string, @Body() dto: UpdateHotelDto) {
        return new OkResponse(await this.hotelService.update(hotelId, dto));
    }

    @Permissions('hotel.delete')
    @Delete(':hotelId')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('hotelId') hotelId: string) {
        return new OkResponse(await this.hotelService.remove(hotelId));
    }

    @Permissions('hotel.update')
    @Post(':hotelId/images')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Param('hotelId') hotelId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return new OkResponse(await this.hotelService.uploadHotelImage(hotelId, file));
    }

    @Permissions('role.assign_permission')
    @Patch(':hotelId/owner')
    @HttpCode(HttpStatus.OK)
    async assignOwner(
        @Param('hotelId')
        hotelId: string,

        @Body()
        dto: AssignHotelOwnerDto,
    ) {
        return new OkResponse(await this.hotelService.assignOwner(
            hotelId,
            dto,
        ));
    }
}
