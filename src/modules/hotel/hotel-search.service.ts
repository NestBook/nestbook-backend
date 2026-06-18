import { Injectable } from '@nestjs/common';
import { RoomTypeService } from '../room-type/room-type.service';
import { AvailabilityService } from '../availability/availability.service';
import { HotelService } from '../hotel/hotel.service';
import type { AvailabilityResult } from '../availability/types/availability-result.type';
import { BadRequestError } from '../../commons/core/response/error/badrequest.error';

@Injectable()
export class HotelSearchService {
    constructor(
        private readonly roomTypeService: RoomTypeService,
        private readonly availabilityService: AvailabilityService,
        private readonly hotelService: HotelService,
    ) { }

    async search(query: any) {
        const page = Number(query.page ?? 1);
        const pageSize = Number(query.pageSize ?? 10);
        const quantity = Number(query.quantity ?? 1);

        const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
        const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

        const checkIn = query.checkInDate ? new Date(query.checkInDate) : null;
        const checkOut = query.checkOutDate ? new Date(query.checkOutDate) : null;

        if (checkIn && checkOut && checkIn >= checkOut) {
            throw new BadRequestError('Invalid date range');
        }

        const hotels = await this.hotelService.findAllActive();
        const result: any[] = [];

        for (const hotel of hotels) {

            const roomTypes = await this.roomTypeService.getByHotelRaw(hotel.id);

            const availableRoomTypes: any[] = [];

            let minPricePerNight = Infinity;

            for (const room of roomTypes) {
                if (query.roomType &&
                    !room.name.toLowerCase().includes(query.roomType.toLowerCase())
                ) continue;

                if (minPrice !== undefined && room.price < minPrice) continue;
                if (maxPrice !== undefined && room.price > maxPrice) continue;

                let availability: AvailabilityResult | null = null;

                if (checkIn && checkOut) {
                    availability = await this.availabilityService.check({
                        roomTypeId: room.id,
                        checkInDate: checkIn,
                        checkOutDate: checkOut,
                        quantity,
                    });

                    if (!availability?.canBook) continue;
                }

                minPricePerNight = Math.min(minPricePerNight, room.price);

                availableRoomTypes.push({
                    id: room.id,
                    name: room.name,
                    pricePerNight: room.price,
                    availableQuantity: availability?.available ?? room.totalQuantity,
                });
            }

            if (availableRoomTypes.length === 0) continue;

            result.push({
                id: hotel.id,
                name: hotel.name,
                city: hotel.city,
                address: hotel.address,
                phone: hotel.phone,
                averageRating: 4.5, // placeholder
                reviewCount: 20,     // placeholder
                minPricePerNight: minPricePerNight === Infinity ? 0 : minPricePerNight,
                availableRoomTypes,
            });
        }

        const totalItems = result.length;

        const paged = result.slice(
            (page - 1) * pageSize,
            page * pageSize,
        );

        return {
            success: true,
            data: paged,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize),
            },
        };
    }
}