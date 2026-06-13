import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class SyncRolePermissionsDto {
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    permissionIds: string[];
}