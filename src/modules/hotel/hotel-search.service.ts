import { Injectable } from '@nestjs/common';
import { RoomTypeService } from '../room-type/room-type.service';
import { AvailabilityService } from '../availability/availability.service';
import type { AvailabilityResult } from '../availability/types/availability-result.type';
import { BadRequestError } from '../../commons/core/response/error/badrequest.error';

@Injectable()
export class HotelSearchService {
    constructor(
        private readonly roomTypeService: RoomTypeService,
        private readonly availabilityService: AvailabilityService,
    ) { }

    async search(query: any) {
        const quantity = Number(query.quantity ?? 1);
        const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
        const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

        const checkIn = query.checkInDate ? new Date(query.checkInDate) : null;
        const checkOut = query.checkOutDate ? new Date(query.checkOutDate) : null;

        if (checkIn && checkOut && checkIn >= checkOut) {
            throw new BadRequestError('Invalid date range');
        }

        const roomTypes = await this.roomTypeService.findAll();
        const result: any[] = [];

        for (const room of roomTypes) {
            //filter price
            if (minPrice !== undefined && room.price < minPrice) continue;
            if (maxPrice !== undefined && room.price > maxPrice) continue;

            if (query.roomType) {
                if (!room.name.toLowerCase().includes(query.roomType.toLowerCase())) continue;
            }

            //availability check
            let availability: AvailabilityResult | null = null;

            if (checkIn && checkOut) {
                availability = await this.availabilityService.check({
                    roomTypeId: room.id,
                    checkInDate: new Date(checkIn),
                    checkOutDate: new Date(checkOut),
                    quantity,
                });

                if (!availability?.canBook) continue;
            }

            result.push({
                hotelId: room.hotelId,
                roomType: {
                    id: room.id,
                    name: room.name,
                    pricePerNight: room.price,
                    availableQuantity: availability?.available ?? room.totalQuantity,
                },
            });
        }

        return this.group(result);
    }

    private group(rows: any[]) {
        const map = new Map();

        for (const r of rows) {
            if (!map.has(r.hotelId)) {
                map.set(r.hotelId, {
                    id: r.hotelId,
                    rooms: [],
                });
            }

            map.get(r.hotelId).rooms.push(r.roomType);
        }

        return Array.from(map.values());
    }
}