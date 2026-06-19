import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BookingEntity, BookingStatus } from 'src/modules/booking/entity/booking.entity';
import { AvailabilityContext } from '../types/availability-context.type';

// Only CONFIRMED bookings count here.
// PENDING_PAYMENT bookings are tracked separately via Redis hold (RedisHoldStrategy).
const CONFIRMED_STATUSES = [BookingStatus.CONFIRMED];

@Injectable()
export class BookedAvailabilityStrategy {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepo: Repository<BookingEntity>,
    ) {}

    async getBooked(ctx: AvailabilityContext): Promise<number> {
        const result = await this.bookingRepo
            .createQueryBuilder('booking')
            .select('COALESCE(SUM(booking.quantity), 0)', 'total')
            .where('booking.roomTypeId = :roomTypeId', { roomTypeId: ctx.roomTypeId })
            .andWhere('booking.bookingStatus IN (:...statuses)', { statuses: CONFIRMED_STATUSES })
            .andWhere('booking.checkInDate < :checkOut', { checkOut: ctx.checkOutDate })
            .andWhere('booking.checkOutDate > :checkIn', { checkIn: ctx.checkInDate })
            .getRawOne();

        return Number(result.total);
    }
}
