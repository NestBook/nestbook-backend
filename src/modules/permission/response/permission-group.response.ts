import { PermissionStatus } from '../entities/permission.entity';

export interface PermissionItemResponse {
    id: string;
    code: string;
    name: string;
    resource: string;
    action: string;
    description: string | null;
    status: PermissionStatus;
}

export interface PermissionGroupResponse {
    resource: string;
    permissions: PermissionItemResponse[];
}