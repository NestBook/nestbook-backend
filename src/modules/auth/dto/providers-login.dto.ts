import {
    IsEnum,
    IsString,
    MaxLength,
} from 'class-validator';

import { AuthProvider } from '../entities/auth.entity';

export class ProviderLoginDto {
    @IsEnum(AuthProvider)
    provider: AuthProvider;
    @IsString()
    @MaxLength(5000)
    providerToken: string;
}