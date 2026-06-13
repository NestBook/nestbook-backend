import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class BookingQuoteDto {
  @IsString()
  roomTypeId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsDateString()
  checkInDate!: string;

  @IsDateString()
  checkOutDate!: string;

  @IsOptional()
  @IsString()
  platformVoucherCode?: string;

  @IsOptional()
  @IsString()
  hotelVoucherCode?: string;
}