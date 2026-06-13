import { UserStatus } from '../entities/user.entity';

export interface UserAccessRoleResponse {
    id: string;
    code: string;
    name: string;
}

export interface UserAccessResponse {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    status: UserStatus;

    roles: UserAccessRoleResponse[];

    permissions: string[];
}