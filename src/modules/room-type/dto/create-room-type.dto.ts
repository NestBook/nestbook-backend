import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

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
}