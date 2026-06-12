import { Injectable } from '@nestjs/common';
import { RoomTypeEntity } from './entities/room-type.entity';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import type { IRoomTypeRepository } from './repository/room-type.repository.interface';
import { ROOM_TYPE_REPOSITORY } from './repository/room-type.repository.interface';
import { Inject } from '@nestjs/common';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { ConflictError } from 'src/commons/core/response/error/conflict.error';
import { HotelService } from '../hotel/hotel.service';
import { REDIS_CLIENT } from 'src/infrastructures/redis/redis.constans';

const ROOM_TYPES_KEY = (hotelId: string) => `room-types:hotel:${hotelId}`;
const CACHE_TTL = 60 * 5;

@Injectable()
export class RoomTypeService {
    constructor(
        @Inject(ROOM_TYPE_REPOSITORY)
        private readonly roomTypeRepository: IRoomTypeRepository,

        @Inject(REDIS_CLIENT)
        private readonly redis: any,

        private readonly hotelService: HotelService,
    ) { }

    async create(dto: CreateRoomTypeDto): Promise<RoomTypeEntity> {
        await this.hotelService.findById(dto.hotelId);

        const existing = await this.roomTypeRepository.findByHotelId(dto.hotelId);
        const duplicated = existing.find(
            (r) => r.name.toLowerCase() === dto.name.toLowerCase(),
        );

        if (duplicated) {
            throw new ConflictError('Room type name already exists in this hotel');
        }

        const result = await this.roomTypeRepository.createRoomType({
            hotelId: dto.hotelId,
            name: dto.name,
            bedType: dto.bedType,
            price: dto.price,
            amenities: dto.amenities,
        });

        await this.redis.del(ROOM_TYPES_KEY(dto.hotelId));

        return result;
    }

    async findById(id: string): Promise<RoomTypeEntity> {
        const room = await this.roomTypeRepository.findById(id);

        if (!room) {
            throw new NotFoundError('Room type not found');
        }

        return room;
    }

    async findByHotelId(hotelId: string): Promise<RoomTypeEntity[]> {
        const key = ROOM_TYPES_KEY(hotelId);

        const cached = await this.redis.get(key);
        if (cached) {
            return JSON.parse(cached) as RoomTypeEntity[];
        }

        const data = await this.roomTypeRepository.findByHotelId(hotelId);

        await this.redis.set(
            key,
            JSON.stringify(data),
            'EX',
            CACHE_TTL,
        );

        return data;
    }

    async update(id: string, dto: UpdateRoomTypeDto) {
        const room = await this.findById(id);

        if (dto.name && dto.name !== room.name) {
            const existing = await this.roomTypeRepository.findByHotelId(room.hotelId);

            const duplicated = existing.find(
                (r) => r.name.toLowerCase() === dto.name!.toLowerCase(),
            );

            if (duplicated) {
                throw new ConflictError('Room type name already exists in this hotel');
            }
        }

        const result = await this.roomTypeRepository.updateRoomType(room, {
            name: dto.name,
            bedType: dto.bedType,
            price: dto.price,
            amenities: dto.amenities,
        });

        await this.redis.del(ROOM_TYPES_KEY(room.hotelId));

        return result;
    }

    async remove(id: string): Promise<{ deleted: true }> {
        const room = await this.findById(id);

        await this.roomTypeRepository.softDeleteRoomType(id);

        await this.redis.del(ROOM_TYPES_KEY(room.hotelId));

        return { deleted: true };
    }
}