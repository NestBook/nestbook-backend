export class BookingQuoteResponse {
  roomTypeId!: string;

  hotelId!: string;

  quantity!: number;

  nights!: number;

  pricePerNight!: number;

  roomSubtotal!: number;

  hotelVoucherDiscount!: number;

  platformVoucherDiscount!: number;

  discountAmount!: number;

  finalAmount!: number;

  availableQuantity!: number;

  canBook!: boolean;
}