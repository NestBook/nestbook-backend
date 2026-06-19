import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
    BookingEntity,
    BookingPaymentStatus,
    BookingStatus,
} from '../entity/booking.entity';

const ACTIVE_BOOKING_STATUSES = [
    BookingStatus.CONFIRMED,
    BookingStatus.PENDING_PAYMENT,
];

import { CreateBookingPayload } from '../payload/create-booking.payload';

import type { IBookingRepository } from './booking.repository.interface';

@Injectable()
export class BookingRepository implements IBookingRepository {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingOrmRepository: Repository<BookingEntity>,
    ) { }

    findBookingById(id: string): Promise<BookingEntity | null> {
        return this.bookingOrmRepository.findOne({
            where: {
                id,
            },
        });
    }

    findBookingByCode(bookingCode: string): Promise<BookingEntity | null> {
        return this.bookingOrmRepository.findOne({
            where: {
                bookingCode,
            },
        });
    }

    async createBooking(payload: CreateBookingPayload): Promise<BookingEntity> {
        const booking = this.bookingOrmRepository.create({
            bookingCode: payload.bookingCode,

            userId: payload.userId,

            hotelId: payload.hotelId,
            roomTypeId: payload.roomTypeId,

            guestName: payload.guestName,
            guestEmail: payload.guestEmail,
            guestPhone: payload.guestPhone,

            checkInDate: payload.checkInDate,
            checkOutDate: payload.checkOutDate,

            quantity: payload.quantity,
            nights: payload.nights,

            pricePerNight: payload.pricePerNight,
            roomSubtotal: payload.roomSubtotal,
            discountAmount: payload.discountAmount,
            finalAmount: payload.finalAmount,

            bookingStatus: payload.bookingStatus,
            paymentStatus: payload.paymentStatus,

            holdExpiresAt: payload.holdExpiresAt,
        });

        return this.bookingOrmRepository.save(booking);
    }

    async updateBookingStatus(
        booking: BookingEntity,
        bookingStatus: BookingStatus,
        paymentStatus: BookingPaymentStatus,
    ): Promise<BookingEntity> {
        booking.bookingStatus = bookingStatus;
        booking.paymentStatus = paymentStatus;

        return this.bookingOrmRepository.save(booking);
    }

    async cancelBooking(
        booking: BookingEntity,
        cancelReason: string | null,
    ): Promise<BookingEntity> {
        booking.bookingStatus = BookingStatus.CANCELLED;

        if (booking.paymentStatus === BookingPaymentStatus.PENDING) {
            booking.paymentStatus = BookingPaymentStatus.CANCELLED;
        }

        booking.cancelledAt = new Date();
        booking.cancelReason = cancelReason;

        return this.bookingOrmRepository.save(booking);
    }

    findBookingsByHotelIds(hotelIds: string[]): Promise<BookingEntity[]> {
        if (hotelIds.length === 0) return Promise.resolve([]);

        return this.bookingOrmRepository.find({
            where: hotelIds.map((hotelId) => ({ hotelId })),
            order: { createdAt: 'DESC' },
        });
    }

    async sumBookedQuantity(
        roomTypeId: string,
        checkIn: Date,
        checkOut: Date,
    ): Promise<number> {
        const result = await this.bookingOrmRepository
            .createQueryBuilder('booking')
            .select('COALESCE(SUM(booking.quantity), 0)', 'total')
            .where('booking.roomTypeId = :roomTypeId', { roomTypeId })
            .andWhere('booking.bookingStatus IN (:...statuses)', { statuses: ACTIVE_BOOKING_STATUSES })
            .andWhere('booking.checkInDate < :checkOut', { checkOut })
            .andWhere('booking.checkOutDate > :checkIn', { checkIn })
            .getRawOne();

        return Number(result.total);
    }
}