import { HotelEntity } from '../entities/hotel.entity';
import { CreateHotelPayload } from '../payload/create-hotel.payload';
import { UpdateHotelPayload } from '../payload/update-hotel.payload';

export const HOTEL_REPOSITORY =
    Symbol('HOTEL_REPOSITORY');

export interface IHotelRepository {
    findHotelById(
        id: string,
    ): Promise<HotelEntity | null>;

    findHotelByPhone(phone: string): Promise<HotelEntity | null>;

    createHotel(
        payload: CreateHotelPayload,
    ): Promise<HotelEntity>;

    updateHotel(
        hotel: HotelEntity,
        payload: UpdateHotelPayload,
    ): Promise<HotelEntity>;

    softDeleteHotel(
        id: string,
    ): Promise<void>;

    findByOwnerId(ownerId: string): Promise<HotelEntity[]>;

    findAll(): Promise<HotelEntity[]>;
}