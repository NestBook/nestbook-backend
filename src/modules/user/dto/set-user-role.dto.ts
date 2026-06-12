import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class SetUserRoleDto {
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    roleIds: string[];
}