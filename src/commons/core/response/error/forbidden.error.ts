import { ErrorResponse } from "./error.response";

export class ForbiddenError extends ErrorResponse {
    constructor(message?: string) {
        super('FORBIDDEN', message || 'Access denied', 403);
    }
}