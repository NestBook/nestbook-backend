import { UserAccessResponse } from '../../user/response/user-access.response';

export type AuthUserResponse = UserAccessResponse;

export interface AuthSuccessResponse {
    accessToken: string;
    user: AuthUserResponse;
    requiresMfa: false;
}

export interface AuthMfaRequiredResponse {
    mfaToken: string;
    requiresMfa: true;
}

export type AuthResponse = AuthSuccessResponse | AuthMfaRequiredResponse;