import { Injectable } from '@nestjs/common';

import { RoomTypeService } from '../../room-type/room-type.service';

@Injectable()
export class BookingAggregationStrategy {
  constructor(
    private readonly roomTypeService: RoomTypeService,
  ) {}

  async getTotal(
    roomTypeId: string,
  ): Promise<number> {
    const room =
      await this.roomTypeService.findById(
        roomTypeId,
      );

    return room.totalQuantity;
  }
}