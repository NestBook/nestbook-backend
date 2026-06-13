import { RoomTypeStatus } from '../entities/room-type.entity';

export interface UpdateRoomTypePayload {
    name?: string;
    bedType?: string;
    price?: number;
    amenities?: string[];
    status?: RoomTypeStatus;
}