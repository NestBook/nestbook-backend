import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsString()
  roomTypeId!: string;

  @IsDateString()
  checkInDate!: string;

  @IsDateString()
  checkOutDate!: string;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;
}