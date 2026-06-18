import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
    BookingEntity,
    BookingPaymentStatus,
    BookingStatus,
} from '../entity/booking.entity';

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

    async findByOwnerId(ownerId: string): Promise<BookingEntity[]> {
        return this.bookingOrmRepository
            .createQueryBuilder('booking')
            .leftJoin('hotels', 'hotel', 'hotel.id = booking.hotelId')
            .where('hotel.ownerId = :ownerId', { ownerId })
            .getMany();
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
}