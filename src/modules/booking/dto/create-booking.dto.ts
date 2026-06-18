import {
    IsDateString,
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    IsInt,
} from 'class-validator';

export class CreateBookingDto {
    @IsString()
    roomTypeId: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsDateString()
    checkInDate: string;

    @IsDateString()
    checkOutDate: string;

    @IsString()
    @MaxLength(150)
    customerName: string;

    @IsEmail()
    @MaxLength(255)
    customerEmail: string;

    @IsString()
    @MaxLength(30)
    @Matches(/^[0-9+\-\s()]{8,30}$/, {
        message: 'customerPhone must be a valid phone number',
    })
    customerPhone: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    platformVoucherCode?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    hotelVoucherCode?: string | null;
}
