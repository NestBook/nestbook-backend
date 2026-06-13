import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

import { UserStatus } from '../entities/user.entity';

export class CreateUserDto {
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

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}