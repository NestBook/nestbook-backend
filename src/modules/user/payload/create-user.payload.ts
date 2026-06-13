import { UserStatus } from '../entities/user.entity';

export interface CreateUserPayload {
    email: string;
    fullName: string;
    phone: string | null;
    status: UserStatus;
}