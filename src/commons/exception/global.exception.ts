import {
    ArgumentsHost,
    Catch,
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