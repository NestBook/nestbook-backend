import { Inject, Injectable } from '@nestjs/common';
import { ConflictError } from 'src/commons/core/response/error/conflict.error';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { ForbiddenError } from 'src/commons/core/response/error/forbidden.error';
import { LoggerService } from 'src/infrastructures/logger/logger.service';
import { UserService } from '../user/user.service';
import { AssignHotelOwnerDto } from './dto/assign-hotel-owner.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelEntity, HotelStatus } from './entities/hotel.entity';
import { HOTEL_REPOSITORY } from './repository/hotel.repository.interface';
import type { IHotelRepository } from './repository/hotel.repository.interface';
import { REDIS_CLIENT } from 'src/infrastructures/redis/redis.constans';

const HOTEL_KEY = (id: string) => `hotel:detail:${id}`;
const CACHE_TTL = 60 * 5;

@Injectable()
export class HotelService {
    constructor(
        @Inject(HOTEL_REPOSITORY) private readonly hotelRepository:
            IHotelRepository,

        @Inject('REDIS_CLIENT')
        private readonly redis: any,

        private readonly userService: UserService,

        private readonly logger: LoggerService,
    ) { }

    async create(dto: CreateHotelDto): Promise<HotelEntity> {
        await this.validatePhoneNotExists(dto.phone);

        return this.hotelRepository.createHotel({
            name: dto.name,
            city: dto.city,
            address: dto.address,
            phone: dto.phone,
            description: dto.description ?? null,
            ownerId: null,
            status: HotelStatus.ACTIVE,
        });
    }

    async findById(hotelId: string): Promise<HotelEntity> {
        const key = HOTEL_KEY(hotelId);

        const cached = await this.redis.get(key);
        if (cached) {
            return JSON.parse(cached) as HotelEntity;
        }

        const hotel = await this.getHotelOrThrow(hotelId);

        await this.redis.set(
            key,
            JSON.stringify(hotel),
            'EX',
            CACHE_TTL,
        );

        return hotel;
    }

    async update(
        hotelId: string,
        dto: UpdateHotelDto,
    ): Promise<HotelEntity> {
        const hotel = await this.getHotelOrThrow(hotelId);

        if (dto.phone && dto.phone !== hotel.phone) {
            await this.validatePhoneNotExists(dto.phone);
        }

        const updated = await this.hotelRepository.updateHotel(hotel, {
            name: dto.name,
            city: dto.city,
            address: dto.address,
            phone: dto.phone,
            description: dto.description,
        });

        await this.redis.del(HOTEL_KEY(hotelId));

        return updated;
    }

    async remove(
        hotelId: string,
    ): Promise<{ deleted: true }> {
        const hotel = await this.getHotelOrThrow(hotelId);

        await this.hotelRepository.softDeleteHotel(
            hotel.id,
        );

        await this.redis.del(HOTEL_KEY(hotel.id));

        return {
            deleted: true,
        };
    }

    async assignOwner(
        hotelId: string,
        dto: AssignHotelOwnerDto,
    ): Promise<HotelEntity> {
        const hotel = await this.getHotelOrThrow(hotelId);

        await this.validateOwnerExists(dto.ownerId);

        const updated = await this.hotelRepository.updateHotel(hotel, {
            ownerId: dto.ownerId,
        });

        await this.redis.del(HOTEL_KEY(hotelId));

        return updated;
    }

    async findByOwnerId(ownerId: string) {
        return this.hotelRepository.findByOwnerId(ownerId);
    }

    async findOwnedHotelById(ownerId: string, hotelId: string) {
        const hotel = await this.getHotelOrThrow(hotelId);

        if (hotel.ownerId !== ownerId) {
            throw new ForbiddenError('Not your hotel');
        }

        return hotel;
    }

    async findAll(): Promise<HotelEntity[]> {
        return this.hotelRepository.findAll();
    }

<<<<<<< HEAD
    async findAllActive(): Promise<HotelEntity[]> {
        return this.hotelRepository.findAllActive();
    }

=======
>>>>>>> 62bf8dea022649e4eddbd61d8249ce0c070eef86
    async updateOwnedHotel(
        ownerId: string,
        hotelId: string,
        dto: UpdateHotelDto,
    ) {
        const hotel = await this.getHotelOrThrow(hotelId);

        if (hotel.ownerId !== ownerId) {
            throw new ForbiddenError('Not your hotel');
        }

        return this.update(hotelId, dto);
    }

    private async getHotelOrThrow(
        hotelId: string,
    ): Promise<HotelEntity> {
        const hotel = await this.hotelRepository.findHotelById(
            hotelId,
        );

        if (!hotel) {
            this.logger.error(`Hotel not found: ${hotelId}`);

            throw new ForbiddenError('Hotel not found');
        }

        return hotel;
    }

    private async validateOwnerExists(
        ownerId: string,
    ): Promise<void> {
        const owner = await this.userService.findById(ownerId);

        if (!owner) {
            throw new NotFoundError('Owner not found');
        }
    }

    private async validatePhoneNotExists(phone: string): Promise<void> {
        const hotel = await this.hotelRepository.findHotelByPhone(phone);

        if (hotel) {
            throw new ConflictError('Hotel phone already exists');
        }
    }
}