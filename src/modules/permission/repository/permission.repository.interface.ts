import { PermissionEntity } from '../entities/permission.entity';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface IPermissionRepository {
    findPermissionById(id: string): Promise<PermissionEntity | null>;

    findExistingPermissionIds(permissionIds: string[]): Promise<string[]>;

    findPermissionCodesByIds(permissionIds: string[]): Promise<string[]>;
}