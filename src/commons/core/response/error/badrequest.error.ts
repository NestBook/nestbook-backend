import { ErrorResponse } from "./error.response";

export class BadRequestError extends ErrorResponse {
    constructor(message: string) {
        super('BAD_REQUEST', message, 400);
    }
}