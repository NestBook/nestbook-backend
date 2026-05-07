import { ErrorResponse } from "./error.response";

export class InternalError extends ErrorResponse {
    constructor() {
        super('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
}