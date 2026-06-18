import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAvailabilityBlockDto {
  @IsString()
  roomTypeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @Type(() => Number)
  @IsNumber()
  blockedQuantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
