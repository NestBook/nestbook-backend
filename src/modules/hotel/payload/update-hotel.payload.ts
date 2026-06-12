import { HotelStatus } from '../entities/hotel.entity';

export interface UpdateHotelPayload {
    name?: string;
    city?: string;
    address?: string;
    phone?: string;
    description?: string | null;
    ownerId?: string | null;
    status?: HotelStatus;
}