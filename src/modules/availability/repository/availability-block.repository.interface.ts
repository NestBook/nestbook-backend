import { AvailabilityBlockEntity } from '../entities/availability-block.entity';

export const AVAILABILITY_BLOCK_REPOSITORY =
  Symbol('AVAILABILITY_BLOCK_REPOSITORY');

export interface IAvailabilityBlockRepository {
  create(
    payload: Partial<AvailabilityBlockEntity>,
  ): Promise<AvailabilityBlockEntity>;

  delete(id: string): Promise<void>;

  sumBlockedQuantity(
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<number>;

  findByRoomType(
    roomTypeId: string,
  ): Promise<AvailabilityBlockEntity[]>;
}