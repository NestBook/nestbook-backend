import { ErrorResponse } from "./error.response";

export class BadRequestError extends ErrorResponse {
    constructor(message: string, meta?: any) {
        super('BAD_REQUEST', message, 400, meta);
    }
}