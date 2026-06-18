import {
    BookingPaymentStatus,
    BookingStatus,
} from '../entity/booking.entity';

export interface CreateBookingPayload {
    bookingCode: string;

    userId: string | null;

    hotelId: string;
    roomTypeId: string;

    guestName: string;
    guestEmail: string;
    guestPhone: string;

    checkInDate: Date;
    checkOutDate: Date;

    quantity: number;
    nights: number;

    pricePerNight: number;
    roomSubtotal: number;
    discountAmount: number;
    finalAmount: number;

    bookingStatus: BookingStatus;
    paymentStatus: BookingPaymentStatus;

    holdExpiresAt: Date | null;
}