import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    @MaxLength(255)
    email: string;

    @IsString()
    @MaxLength(150)
    fullName: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    @Matches(/^[0-9+\-\s()]{8,30}$/, {
        message: 'phone must be a valid phone number',
    })
    phone?: string | null;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;
}