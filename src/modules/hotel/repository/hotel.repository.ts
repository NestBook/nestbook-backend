import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HotelEntity } from '../entities/hotel.entity';

import { CreateHotelPayload } from '../payload/create-hotel.payload';
import { UpdateHotelPayload } from '../payload/update-hotel.payload';

import type { IHotelRepository } from './hotel.repository.interface';

@Injectable()
export class HotelRepository implements IHotelRepository {
    constructor(
        @InjectRepository(HotelEntity)
        private readonly hotelOrmRepository: Repository<HotelEntity>,
    ) { }

    findHotelById(id: string): Promise<HotelEntity | null> {
        return this.hotelOrmRepository.findOne({
            where: {
                id,
            },
        });
    }

    findHotelByPhone(phone: string): Promise<HotelEntity | null> {
        return this.hotelOrmRepository.findOne({
            where: { phone },
        });
    }

    async createHotel(
        payload: CreateHotelPayload,
    ): Promise<HotelEntity> {
        const hotel = this.hotelOrmRepository.create({
            name: payload.name,
            city: payload.city,
            address: payload.address,
            phone: payload.phone,
            description: payload.description,
            ownerId: payload.ownerId,
            status: payload.status,
        });

        return this.hotelOrmRepository.save(hotel);
    }

    async updateHotel(
        hotel: HotelEntity,
        payload: UpdateHotelPayload,
    ): Promise<HotelEntity> {
        Object.assign(hotel, {
            name: payload.name ?? hotel.name,
            city: payload.city ?? hotel.city,
            address: payload.address ?? hotel.address,
            phone: payload.phone ?? hotel.phone,
            description:
                payload.description === undefined
                    ? hotel.description
                    : payload.description,
            ownerId:
                payload.ownerId === undefined
                    ? hotel.ownerId
                    : payload.ownerId,
            status: payload.status ?? hotel.status,
        });

        return this.hotelOrmRepository.save(hotel);
    }

    async softDeleteHotel(id: string): Promise<void> {
        await this.hotelOrmRepository.softDelete(id);
    }

    findByOwnerId(ownerId: string): Promise<HotelEntity[]> {
        return this.hotelOrmRepository.find({
            where: { ownerId },
        });
    }

    findAll(): Promise<HotelEntity[]> {
        return this.hotelOrmRepository.find();
    }
}