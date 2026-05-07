import { ErrorResponse } from "./error.response";

export class ValidationError extends ErrorResponse {
    constructor(fieldErrors: Record<string, string[]>) {
        super('VALIDATION_ERROR', 'Invalid input', 422, fieldErrors);
    }
}