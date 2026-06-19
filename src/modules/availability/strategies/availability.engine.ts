import { Injectable } from '@nestjs/common';

import { BlockAvailabilityStrategy } from './block-availability.strategy';
import { BookedAvailabilityStrategy } from './booked-availability.strategy';
import { RedisHoldStrategy } from './redis-hold.strategy';

import { AvailabilityContext } from '../types/availability-context.type';
import { AvailabilityResult } from '../types/availability-result.type';
import { RoomTypeService } from 'src/modules/room-type/room-type.service';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';

@Injectable()
export class AvailabilityEngine {
    constructor(
        private readonly blockStrategy: BlockAvailabilityStrategy,

        private readonly bookedStrategy: BookedAvailabilityStrategy,

        private readonly holdStrategy: RedisHoldStrategy,

        private readonly roomTypeService: RoomTypeService,
    ) { }

    async calculate(ctx: AvailabilityContext): Promise<AvailabilityResult> {
        const room = await this.roomTypeService.findById(ctx.roomTypeId);

        if (!room) {
            throw new NotFoundError('Room type not found');
        }

        const total = room.totalQuantity;

        const [blocked, booked, held] = await Promise.all([
            this.blockStrategy.getBlocked(ctx),
            this.bookedStrategy.getBooked(ctx),
            this.holdStrategy.getHeld(ctx),
        ]);

        const available = Math.max(total - booked - held - blocked, 0);

        return {
            roomTypeId: ctx.roomTypeId,

            total,

            booked,

            held,

            blocked,

            available,

            canBook: available >= ctx.quantity,
        };
    }
}