import { ErrorResponse } from "./error.response";

export class NotFoundError extends ErrorResponse {
    constructor(message: string, meta?: any) {
        super('NOT_FOUND', message, 404, meta);
    }
}