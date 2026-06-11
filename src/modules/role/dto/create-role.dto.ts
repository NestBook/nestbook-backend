import {
    IsEnum,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';
import { RoleStatus } from '../entities/role.entity';

export class CreateRoleDto {
    @IsString()
    @MaxLength(100)
    @Matches(/^[A-Z0-9_]+$/, {
        message: 'code must be uppercase snake case, example: HOTEL_MANAGER',
    })
    code: string;

    @IsString()
    @MaxLength(150)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsEnum(RoleStatus)
    status?: RoleStatus;
}