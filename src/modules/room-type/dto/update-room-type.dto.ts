import { IsArray, IsInt, IsOptional, IsString, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoomTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bedType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  totalQuantity!: number;
}