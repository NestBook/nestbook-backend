import { RoomTypeStatus } from '../entities/room-type.entity';

export interface CreateRoomTypePayload {
    hotelId: string;
    name: string;
    bedType: string;
    price: number;
    amenities: string[];
    totalQuantity: number;
    status?: RoomTypeStatus;
}