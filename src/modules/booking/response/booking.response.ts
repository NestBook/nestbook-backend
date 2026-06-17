import {
    BookingPaymentStatus,
    BookingStatus,
} from '../entity/booking.entity';

export interface BookingResponse {
    id: string;
    bookingCode: string;

    userId: string | null;

    hotelId: string;
    roomTypeId: string;

    hotelName?: string;
    roomTypeName?: string;

    customerName: string;
    customerEmail: string;
    customerPhone: string;

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

    createdAt: Date;

    cancelledAt: Date | null;
    cancelReason: string | null;
}
