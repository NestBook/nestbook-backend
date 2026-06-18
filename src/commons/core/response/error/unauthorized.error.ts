import { ErrorResponse } from "./error.response";

export class UnauthorizedError extends ErrorResponse {
    constructor(message?: string) {
        super(message || 'UNAUTHORIZED', message || 'Unauthorized', 401);
    }
}