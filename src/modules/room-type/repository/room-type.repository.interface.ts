import { RoomTypeEntity } from '../entities/room-type.entity';
import { CreateRoomTypePayload } from '../payload/create-room-type.payload';
import { UpdateRoomTypePayload } from '../payload/update-room-type.payload';

export const ROOM_TYPE_REPOSITORY = Symbol('ROOM_TYPE_REPOSITORY');

export interface IRoomTypeRepository {
  findById(id: string): Promise<RoomTypeEntity | null>;
  
  findByHotelId(hotelId: string): Promise<RoomTypeEntity[]>;

  createRoomType(
    payload: CreateRoomTypePayload,
  ): Promise<RoomTypeEntity>;

  updateRoomType(
    entity: RoomTypeEntity,
    payload: UpdateRoomTypePayload,
  ): Promise<RoomTypeEntity>;

  softDeleteRoomType(id: string): Promise<void>;

  getManager(): import('typeorm').EntityManager;

  findAll(): Promise<RoomTypeEntity[]>;
}