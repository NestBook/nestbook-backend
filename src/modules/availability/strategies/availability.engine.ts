import { Injectable } from '@nestjs/common';

import { BookingAggregationStrategy } from './booking-aggregation.strategy';
import { BlockAvailabilityStrategy } from './block-availability.strategy';
import { RedisHoldStrategy } from './redis-hold.strategy';
import { AvailabilityContext } from '../types/availability-context.type';
import { AvailabilityResult } from '../types/availability-result.type';

@Injectable()
export class AvailabilityEngine {
    constructor(
        private readonly bookingAggregation:
            BookingAggregationStrategy,

        private readonly blockStrategy:
            BlockAvailabilityStrategy,

        private readonly holdStrategy:
            RedisHoldStrategy,
    ) { }

    async calculate(
        ctx: AvailabilityContext,
    ): Promise<AvailabilityResult> {
        const total =
            await this.bookingAggregation.getTotal(
                ctx.roomTypeId,
            );

        const blocked =
            await this.blockStrategy.getBlocked(
                ctx,
            );

        const held =
            await this.holdStrategy.getHeld();

        const booked = 0;

        const available =
            total - booked - held - blocked;

        return {
            roomTypeId: ctx.roomTypeId,

            total,

            booked,

            held,

            blocked,

            available,

            canBook:
                available >= ctx.quantity,
        };
    }
}