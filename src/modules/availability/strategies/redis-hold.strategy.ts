import { Injectable } from '@nestjs/common';

import { RedisService } from 'src/infrastructures/redis/redis.service';
import { AvailabilityContext } from '../types/availability-context.type';

interface BookingHoldPayload {
  bookingCode: string;
  roomTypeId: string;
  quantity: number;
  checkInDate: string;
  checkOutDate: string;
}

@Injectable()
export class RedisHoldStrategy {
  private readonly keyPrefix = 'nestbook:booking:hold';

  constructor(private readonly redisService: RedisService) { }

  async getHeld(ctx: AvailabilityContext): Promise<number> {
    const keys = await this.redisService.keys(
      `${this.keyPrefix}:room-type:${ctx.roomTypeId}:booking:*`,
    );

    if (keys.length === 0) {
      return 0;
    }

    const rawHolds = await this.redisService.mget(keys);

    let totalHeld = 0;

    for (const rawHold of rawHolds) {
      if (!rawHold) {
        continue;
      }

      const hold = this.parseHold(rawHold);

      if (!hold) {
        continue;
      }

      const isOverlap = this.isDateRangeOverlap(
        new Date(hold.checkInDate),
        new Date(hold.checkOutDate),
        ctx.checkInDate,
        ctx.checkOutDate,
      );

      if (isOverlap) {
        totalHeld += Number(hold.quantity);
      }
    }

    return totalHeld;
  }

  private parseHold(rawHold: string): BookingHoldPayload | null {
    try {
      return JSON.parse(rawHold) as BookingHoldPayload;
    } catch {
      return null;
    }
  }

  private isDateRangeOverlap(
    holdCheckInDate: Date,
    holdCheckOutDate: Date,
    requestedCheckInDate: Date,
    requestedCheckOutDate: Date,
  ): boolean {
    return (
      holdCheckInDate < requestedCheckOutDate &&
      holdCheckOutDate > requestedCheckInDate
    );
  }
}
