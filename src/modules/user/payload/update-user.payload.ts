import { UserStatus } from '../entities/user.entity';

export interface UpdateUserPayload {
    email?: string;
    fullName?: string;
    phone?: string | null;
    status?: UserStatus;
}
