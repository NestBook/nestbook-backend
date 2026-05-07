import { ErrorResponse } from "./error.response";

export class ForbiddenError extends ErrorResponse {
    constructor() {
        super('FORBIDDEN', 'Access denied', 403);
    }
}