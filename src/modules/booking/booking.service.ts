import { Injectable } from '@nestjs/common';
import { BookingQuoteDto } from './dto/booking-quote.dto';
import { RoomTypeService } from '../room-type/room-type.service';
import { AvailabilityService } from '../availability/availability.service';
import { BookingQuoteResponse } from './response/booking-quote.response';
import { BadRequestError } from '../../commons/core/response/error/badrequest.error';

@Injectable()
export class BookingService {
  constructor(
    private readonly roomTypeService: RoomTypeService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async quote(
    dto: BookingQuoteDto,
  ): Promise<BookingQuoteResponse> {

    if (dto.quantity <= 0) {
      throw new BadRequestError('Quantity must be >= 1');
    }

    const nights = this.calculateNights(
      dto.checkInDate,
      dto.checkOutDate,
    );

    const roomType =
      await this.roomTypeService.findById(dto.roomTypeId);

    const availability =
      await this.availabilityService.check({
        roomTypeId: dto.roomTypeId,
        checkInDate: new Date(dto.checkInDate),
        checkOutDate: new Date(dto.checkOutDate),
        quantity: dto.quantity,
      });

    const roomSubtotal =
      roomType.price * nights * dto.quantity;

    const hotelVoucherDiscount = 0;
    const platformVoucherDiscount = 0;

    const discountAmount =
      hotelVoucherDiscount + platformVoucherDiscount;

    const finalAmount =
      roomSubtotal - discountAmount;

    return {
      roomTypeId: roomType.id,
      hotelId: roomType.hotelId,
      quantity: dto.quantity,
      nights,
      pricePerNight: roomType.price,
      roomSubtotal,
      hotelVoucherDiscount,
      platformVoucherDiscount,
      discountAmount,
      finalAmount,
      availableQuantity: availability.available,
      canBook: availability.canBook,
    };
  }

  private calculateNights(
    checkInDate: string,
    checkOutDate: string,
  ): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const nights =
      (checkOut.getTime() - checkIn.getTime()) /
      (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      throw new BadRequestError(
        'Check-out date must be after check-in date',
      );
    }

    return nights;
  }
}