import { IsArray, IsInt, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomTypeDto {
  @IsString()
  hotelId!: string;

  @IsString()
  name!: string;

  @IsString()
  bedType!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsArray()
  amenities!: string[];

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  totalQuantity!: number;
}