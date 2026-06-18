import { UserEntity } from '../entities/user.entity';
import { CreateUserPayload } from '../payload/create-user.payload';
import { UpdateUserPayload } from '../payload/update-user.payload';
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
    findUserById(id: string): Promise<UserEntity | null>;

    findUserByEmail(
        email: string,
        options?: {
            withDeleted?: boolean;
        },
    ): Promise<UserEntity | null>;

    createUser(payload: CreateUserPayload): Promise<UserEntity>;

    updateUser(
        user: UserEntity,
        payload: UpdateUserPayload,
    ): Promise<UserEntity>;

    softDeleteUser(id: string): Promise<void>;

    findRoleIdsByUserId(userId: string): Promise<string[]>;

    setUserRoles(
        userId: string,
        addedRoleIds: string[],
        removedRoleIds: string[],
    ): Promise<void>;

    findAll(): Promise<UserEntity[]>;
}