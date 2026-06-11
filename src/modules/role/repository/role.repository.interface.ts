import { RoleEntity } from '../entities/role.entity';
import { CreateRolePayload } from '../payload/create-role.payload';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
    findRoleById(id: string): Promise<RoleEntity | null>;

    findRoleByCode(
        code: string,
    ): Promise<RoleEntity | null>;

    createRole(payload: CreateRolePayload): Promise<RoleEntity>;

    findExistingPermissionIds(permissionIds: string[]): Promise<string[]>;

    findPermissionIdsByRoleId(roleId: string): Promise<string[]>;

    createRolePermissions(
        roleId: string,
        permissionIds: string[],
    ): Promise<void>;

    deleteRolePermissions(
        roleId: string,
        permissionIds: string[],
    ): Promise<void>;
}