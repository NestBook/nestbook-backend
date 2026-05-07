import { ErrorResponse } from "./error.response";

export class ConflictError extends ErrorResponse {
    constructor(message: string) {
        super('CONFLICT', message, 409);
    }
}