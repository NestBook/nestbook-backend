import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQuoteDto } from './dto/booking-quote.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

import {
  BookingEntity,
  BookingPaymentStatus,
  BookingStatus,
} from './entity/booking.entity';

import { BookingResponse } from './response/booking.response';
import { BookingQuoteResponse } from './response/booking-quote.response';

import { BOOKING_REPOSITORY } from './repository/booking.repository.interface';
import type { IBookingRepository } from './repository/booking.repository.interface';

import { AvailabilityService } from '../availability/availability.service';
import { RoomTypeService } from '../room-type/room-type.service';

import { RedisService } from 'src/infrastructures/redis/redis.service';
import { LoggerService } from 'src/infrastructures/logger/logger.service';

import { BadRequestError } from 'src/commons/core/response/error/badrequest.error';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';
import { HotelEntity } from '../hotel/entities/hotel.entity';
import { RoomTypeEntity } from '../room-type/entities/room-type.entity';

const BOOKING_HOLD_TTL_SECONDS = 60 * 2;
const BOOKING_HOLD_KEY_PREFIX = 'nestbook:booking:hold';

@Injectable()
export class BookingService {
  private readonly context = BookingService.name;

  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    private readonly roomTypeService: RoomTypeService,

    private readonly availabilityService: AvailabilityService,

    private readonly redisService: RedisService,

    @InjectRepository(HotelEntity)
    private readonly hotelRepository: Repository<HotelEntity>,

    @InjectRepository(RoomTypeEntity)
    private readonly roomTypeRepository: Repository<RoomTypeEntity>,

    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) { }

  async quote(dto: BookingQuoteDto): Promise<BookingQuoteResponse> {
    this.validateQuantity(dto.quantity);

    const nights = this.calculateNights(dto.checkInDate, dto.checkOutDate);

    const roomType = await this.roomTypeService.findById(dto.roomTypeId);

    const availability = await this.availabilityService.check({
      roomTypeId: dto.roomTypeId,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      quantity: dto.quantity,
    });

    const pricePerNight = Number(roomType.price);
    const roomSubtotal = pricePerNight * nights * dto.quantity;

    const hotelVoucherDiscount = 0;
    const platformVoucherDiscount = 0;
    const discountAmount = hotelVoucherDiscount + platformVoucherDiscount;
    const finalAmount = roomSubtotal - discountAmount;

    return {
      roomTypeId: String(roomType.id),
      hotelId: String(roomType.hotelId),
      quantity: dto.quantity,
      nights,
      pricePerNight,
      roomSubtotal,
      hotelVoucherDiscount,
      platformVoucherDiscount,
      discountAmount,
      finalAmount,
      availableQuantity: availability.available,
      canBook: availability.canBook,
    };
  }

  async create(dto: CreateBookingDto): Promise<BookingResponse> {
    this.validateQuantity(dto.quantity);

    const nights = this.calculateNights(dto.checkInDate, dto.checkOutDate);

    const roomType = await this.roomTypeService.findById(dto.roomTypeId);

    const availability = await this.availabilityService.check({
      roomTypeId: dto.roomTypeId,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      quantity: dto.quantity,
    });

    if (!availability.canBook) {
      this.logger.error(
        `Room type is not available. roomTypeId=${dto.roomTypeId}, requested=${dto.quantity}, available=${availability.available}`,
        this.context,
      );

      throw new BadRequestError('Room type is not available');
    }

    const pricePerNight = Number(roomType.price);
    const roomSubtotal = pricePerNight * nights * dto.quantity;

    const discountAmount = 0;
    const finalAmount = roomSubtotal - discountAmount;

    const bookingCode = await this.generateBookingCode();

    const holdExpiresAt = new Date(
      Date.now() + BOOKING_HOLD_TTL_SECONDS * 1000,
    );

    const booking = await this.bookingRepository.createBooking({
      bookingCode,

      userId: null,

      hotelId: String(roomType.hotelId),
      roomTypeId: String(roomType.id),

      guestName: dto.customerName,
      guestEmail: dto.customerEmail,
      guestPhone: dto.customerPhone,

      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),

      quantity: dto.quantity,
      nights,

      pricePerNight,
      roomSubtotal,
      discountAmount,
      finalAmount,

      bookingStatus: BookingStatus.PENDING_PAYMENT,
      paymentStatus: BookingPaymentStatus.PENDING,

      holdExpiresAt,
    });

    await this.createBookingHold(booking);

    return this.mapToResponse(booking);
  }

  async findByBookingCode(bookingCode: string): Promise<BookingResponse> {
    const booking = await this.getBookingByCodeOrThrow(bookingCode);

    return this.mapToResponse(
      booking,
      await this.getBookingDisplayNames(booking),
    );
  }

  async cancel(
    bookingCode: string,
    dto: CancelBookingDto,
  ): Promise<BookingResponse> {
    const booking = await this.getBookingByCodeOrThrow(bookingCode);

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new BadRequestError('Booking is already cancelled');
    }

    if (booking.bookingStatus === BookingStatus.EXPIRED) {
      throw new BadRequestError('Expired booking cannot be cancelled');
    }

    if (booking.bookingStatus === BookingStatus.FAILED) {
      throw new BadRequestError('Failed booking cannot be cancelled');
    }

    const cancelledBooking = await this.bookingRepository.cancelBooking(
      booking,
      dto.reason ?? null,
    );

    await this.removeBookingHold(cancelledBooking);

    return this.mapToResponse(cancelledBooking);
  }

  private async getBookingByCodeOrThrow(
    bookingCode: string,
  ): Promise<BookingEntity> {
    const booking =
      await this.bookingRepository.findBookingByCode(bookingCode);

    if (!booking) {
      this.logger.error(`Booking not found: ${bookingCode}`, this.context);

      throw new NotFoundError('Booking not found');
    }

    return booking;
  }

  private validateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than 0');
    }
  }

  private calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new BadRequestError('Invalid booking date');
    }

    if (checkOut <= checkIn) {
      throw new BadRequestError('Check-out date must be after check-in date');
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / millisecondsPerDay,
    );

    if (nights <= 0) {
      throw new BadRequestError('Booking must be at least 1 night');
    }

    return nights;
  }

  private async generateBookingCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const random = Math.floor(Math.random() * 999999)
        .toString()
        .padStart(6, '0');

      const bookingCode = `NB${year}${month}${day}${random}`;

      const existingBooking =
        await this.bookingRepository.findBookingByCode(bookingCode);

      if (!existingBooking) {
        return bookingCode;
      }
    }

    throw new BadRequestError('Could not generate booking code');
  }

  private async createBookingHold(booking: BookingEntity): Promise<void> {
    const key = this.buildBookingHoldKey(
      String(booking.roomTypeId),
      booking.bookingCode,
    );

    const payload = {
      bookingCode: booking.bookingCode,
      roomTypeId: String(booking.roomTypeId),
      quantity: booking.quantity,
      checkInDate: new Date(booking.checkInDate).toISOString(),
      checkOutDate: new Date(booking.checkOutDate).toISOString(),
    };

    await this.redisService.setWithTTL(
      key,
      JSON.stringify(payload),
      BOOKING_HOLD_TTL_SECONDS,
    );
  }

  private async removeBookingHold(booking: BookingEntity): Promise<void> {
    const key = this.buildBookingHoldKey(
      String(booking.roomTypeId),
      booking.bookingCode,
    );

    await this.redisService.del(key);
  }

  private buildBookingHoldKey(roomTypeId: string, bookingCode: string): string {
    return `${BOOKING_HOLD_KEY_PREFIX}:room-type:${roomTypeId}:booking:${bookingCode}`;
  }

  private async getBookingDisplayNames(
    booking: BookingEntity,
  ): Promise<{ hotelName?: string; roomTypeName?: string }> {
    const [hotel, roomType] = await Promise.all([
      this.hotelRepository.findOne({
        where: {
          id: String(booking.hotelId),
        },
        select: {
          name: true,
        },
      }),
      this.roomTypeRepository.findOne({
        where: {
          id: String(booking.roomTypeId),
        },
        select: {
          name: true,
        },
      }),
    ]);

    return {
      hotelName: hotel?.name,
      roomTypeName: roomType?.name,
    };
  }

  private mapToResponse(
    booking: BookingEntity,
    displayNames: { hotelName?: string; roomTypeName?: string } = {},
  ): BookingResponse {
    return {
      id: String(booking.id),
      bookingCode: booking.bookingCode,

      userId: booking.userId ? String(booking.userId) : null,

      hotelId: String(booking.hotelId),
      roomTypeId: String(booking.roomTypeId),

      hotelName: displayNames.hotelName,
      roomTypeName: displayNames.roomTypeName,

      customerName: booking.guestName,
      customerEmail: booking.guestEmail,
      customerPhone: booking.guestPhone,

      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,

      quantity: booking.quantity,
      nights: booking.nights,

      pricePerNight: Number(booking.pricePerNight),
      roomSubtotal: Number(booking.roomSubtotal),
      discountAmount: Number(booking.discountAmount),
      finalAmount: Number(booking.finalAmount),

      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,

      holdExpiresAt: booking.holdExpiresAt,

      cancelledAt: booking.cancelledAt,
      cancelReason: booking.cancelReason,

      createdAt: booking.createdAt,
    };
  }

}
