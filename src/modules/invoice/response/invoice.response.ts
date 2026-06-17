export interface InvoiceResponse {
    id: string;
    invoiceCode: string;
    bookingId: string;
    bookingCode: string;
    userId: string | null;
    hotelId: string;
    guestName: string;
    guestEmail: string;
    finalAmount: number;
    issuedAt: Date;
}
