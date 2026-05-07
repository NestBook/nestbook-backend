import { ErrorResponse } from "./error.response";

export class UnauthorizedError extends ErrorResponse {
    constructor() {
        super('UNAUTHORIZED', 'Unauthorized', 401);
    }
}