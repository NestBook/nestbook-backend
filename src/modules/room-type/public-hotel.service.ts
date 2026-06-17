import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelEntity, HotelStatus } from '../hotel/entities/hotel.entity';
import { RoomTypeEntity, RoomTypeStatus } from '../room-type/entities/room-type.entity';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { REDIS_CLIENT } from 'src/infrastructures/redis/redis.constans';

const HOTEL_DETAIL_KEY = (id: string) => `hotel:public:detail:${id}`;
const HOTEL_ROOM_TYPES_KEY = (id: string) => `hotel:public:room-types:${id}`;
const HOTEL_LIST_KEY = (q: string) => `hotel:public:list:${q}`;
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

    async getHotelList(query: any) {
        const cacheKey = HOTEL_LIST_KEY(JSON.stringify(query || {}));

        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const qb = this.hotelRepo.createQueryBuilder('hotel')
            .where('hotel.status = :status', { status: HotelStatus.ACTIVE });

        if (query?.city) {
            qb.andWhere('hotel.city LIKE :city', {
                city: `%${query.city}%`,
            });
        }

        qb.orderBy('hotel.createdAt', 'DESC');

        const hotels = await qb.getMany();

        const result = {
            success: true,
            data: hotels,
        };

        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

        return result;
    }

    async getHotelDetail(hotelId: string) {
        const key = HOTEL_DETAIL_KEY(hotelId);

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
            success: true,
            data: hotel,
        };

        await this.redis.set(key, JSON.stringify(result), 'EX', CACHE_TTL);

        return result;
    }

    async getRoomTypes(hotelId: string) {
        const key = HOTEL_ROOM_TYPES_KEY(hotelId);

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