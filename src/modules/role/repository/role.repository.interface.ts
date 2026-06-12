import { RoleEntity } from '../entities/role.entity';
import { CreateRolePayload } from '../payload/create-role.payload';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
    findRoleById(id: string): Promise<RoleEntity | null>;

    findRoleByCode(code: string): Promise<RoleEntity | null>;

    findRolesByIds(roleIds: string[]): Promise<RoleEntity[]>;

    createRole(payload: CreateRolePayload): Promise<RoleEntity>;

    findExistingRoleIds(roleIds: string[]): Promise<string[]>;

    findPermissionIdsByRoleId(roleId: string): Promise<string[]>;

    findPermissionIdsByRoleIds(roleIds: string[]): Promise<string[]>;

    setRolePermissions(
        roleId: string,
        addedPermissionIds: string[],
        removedPermissionIds: string[],
    ): Promise<void>;
}