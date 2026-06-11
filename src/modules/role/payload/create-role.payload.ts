import { RoleStatus } from '../entities/role.entity';

export interface CreateRolePayload {
    code: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    status: RoleStatus;
}