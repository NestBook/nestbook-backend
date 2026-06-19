import {
    BookingEntity,
    BookingPaymentStatus,
    BookingStatus,
} from '../entity/booking.entity';

import { CreateBookingPayload } from '../payload/create-booking.payload';

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface IBookingRepository {
    findBookingById(id: string): Promise<BookingEntity | null>;

    findBookingByCode(bookingCode: string): Promise<BookingEntity | null>;

    findByOwnerId(ownerId: string): Promise<BookingEntity[]>;

    findUserBookings(userId: string): Promise<BookingEntity[]>;

    findGuestBookings(): Promise<BookingEntity[]>;

    createBooking(payload: CreateBookingPayload): Promise<BookingEntity>;

    updateBookingStatus(
        booking: BookingEntity,
        bookingStatus: BookingStatus,
        paymentStatus: BookingPaymentStatus,
    ): Promise<BookingEntity>;

    cancelBooking(
        booking: BookingEntity,
        cancelReason: string | null,
    ): Promise<BookingEntity>;

    sumBookedQuantity(
        roomTypeId: string,
        checkIn: Date,
        checkOut: Date,
    ): Promise<number>;

    findBookingsByHotelIds(hotelIds: string[]): Promise<BookingEntity[]>;
}