import { ErrorResponse } from "./error.response";

export class NotFoundError extends ErrorResponse {
    constructor(message: string) {
        super('NOT_FOUND', message, 404);
    }
}