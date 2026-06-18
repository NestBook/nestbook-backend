import {
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class CreateHotelDto {
    @IsString()
    @MaxLength(255)
    name!: string;

    @IsString()
    @MaxLength(100)
    city!: string;

    @IsString()
    @MaxLength(500)
    address!: string;

    @IsString()
    @MaxLength(30)
    @Matches(/^[0-9+\-\s()]{8,30}$/, {
        message: 'phone must be a valid phone number',
    })
    phone!: string;

    @IsOptional()
    @IsString()
    description?: string | null;
}