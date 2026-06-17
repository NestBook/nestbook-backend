import {
    ArgumentsHost,
    Catch,
    HttpException,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../core/response/error/error.response';
import { InternalError } from '../core/response/error/internal.error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        if (exception instanceof ErrorResponse) {
            return response.status(exception.httpStatus).json({
                success: false,
                error: {
                    code: exception.code,
                    message: exception.message,
                    ...(exception.fieldErrors && { fieldErrors: exception.fieldErrors }),
                },
            });
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const errorResponse = exception.getResponse();
            const message =
                typeof errorResponse === 'object' &&
                    errorResponse !== null &&
                    'message' in errorResponse
                    ? (errorResponse as { message: string | string[] }).message
                    : exception.message;

            return response.status(status).json({
                success: false,
                error: {
                    code: status === HttpStatus.BAD_REQUEST
                        ? 'VALIDATION_ERROR'
                        : exception.name,
                    message: Array.isArray(message)
                        ? message.join(', ')
                        : message,
                },
            });
        }

        const fallback = new InternalError();
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                code: fallback.code,
                message: fallback.message,
            },
        });
    }
}
