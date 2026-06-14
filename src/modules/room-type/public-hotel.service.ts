import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelEntity, HotelStatus } from '../hotel/entities/hotel.entity';
import { RoomTypeEntity, RoomTypeStatus } from '../room-type/entities/room-type.entity';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { REDIS_CLIENT } from 'src/infrastructures/redis/redis.constans';

const PUBLIC_HOTEL_DETAIL_KEY = (hotelId: string) => `nestbook:hotel:public:detail:${hotelId}`;
const PUBLIC_HOTEL_ROOM_TYPES_KEY = (hotelId: string) => `nestbook:hotel:public:room-types:${hotelId}`;
const CACHE_TTL = 60 * 5;

@Injectable()
export class PublicHotelService {
    constructor(
        @InjectRepository(HotelEntity)
        private readonly hotelRepo: Repository<HotelEntity>,

        @InjectRepository(RoomTypeEntity)
        private readonly roomTypeRepo: Repository<RoomTypeEntity>,

        @Inject(REDIS_CLIENT)
        private readonly redis: any,
    ) { }

    async getDetail(hotelId: string) {
        const key = PUBLIC_HOTEL_DETAIL_KEY(hotelId);

        const cached = await this.redis.get(key);
        if (cached) return JSON.parse(cached);

        const hotel = await this.hotelRepo.findOne({
            where: {
                id: hotelId,
                status: HotelStatus.ACTIVE,
            },
            select: {
                id: true,
                name: true,
                city: true,
                address: true,
                phone: true,
                description: true,
            },
        });

        if (!hotel) {
            throw new NotFoundError('Hotel not found');
        }

        const result = {
            ...hotel,
            averageRating: 0,
            reviewCount: 0,
            images: [],
        };

        await this.redis.set(
            key,
            JSON.stringify(result),
            'EX',
            CACHE_TTL,
        );

        return result;
    }

    async getRoomTypes(hotelId: string) {
        const key = PUBLIC_HOTEL_ROOM_TYPES_KEY(hotelId);

        const cached = await this.redis.get(key);
        if (cached) return JSON.parse(cached);

        const [hotel, roomTypes] = await Promise.all([
            this.hotelRepo.findOne({
                where: {
                    id: hotelId,
                    status: HotelStatus.ACTIVE,
                },
                select: {
                    id: true,
                    name: true,
                    city: true,
                },
            }),

            this.roomTypeRepo.find({
                where: {
                    hotelId,
                    status: RoomTypeStatus.ACTIVE,
                },
                select: {
                    id: true,
                    name: true,
                    bedType: true,
                    price: true,
                    amenities: true,
                    totalQuantity: true,
                },
                order: {
                    price: 'ASC',
                },
            }),
        ]);

        if (!hotel) {
            throw new NotFoundError('Hotel not found');
        }

        const result = roomTypes.map((roomType) => ({
            id: roomType.id,
            hotelId,
            name: roomType.name,
            bedType: roomType.bedType,
            amenities: roomType.amenities,
            pricePerNight: roomType.price,
            totalQuantity: roomType.totalQuantity,
            availableQuantity: roomType.totalQuantity,
            images: [],
        }));

        await this.redis.set(
            key,
            JSON.stringify(result),
            'EX',
            CACHE_TTL,
        );

        return result;
    }
}
