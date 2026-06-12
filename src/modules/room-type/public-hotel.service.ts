import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelEntity, HotelStatus } from '../hotel/entities/hotel.entity';
import { RoomTypeEntity, RoomTypeStatus } from '../room-type/entities/room-type.entity';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { REDIS_CLIENT } from 'src/infrastructures/redis/redis.constans';

const PUBLIC_HOTEL_KEY = (hotelId: string) => `hotel:public:${hotelId}`;
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

    async getRoomTypes(hotelId: string) {
        const key = PUBLIC_HOTEL_KEY(hotelId);

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
                },
                order: {
                    price: 'ASC',
                },
            }),
        ]);

        if (!hotel) {
            throw new NotFoundError('Hotel not found');
        }

        const result = { hotel, roomTypes };

        await this.redis.set(
            key,
            JSON.stringify(result),
            'EX',
            CACHE_TTL,
        );

        return result;
    }
}