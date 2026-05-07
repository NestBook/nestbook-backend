import { Inject, Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { getRequestId } from './logger.context';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';
type LogMeta = Record<string, unknown>;

@Injectable()
export class LoggerService implements NestLoggerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: WinstonLogger,
    ) { }

    log(message: unknown, context?: string, meta?: LogMeta): void {
        this.info(message, context, meta);
    }

    info(message: unknown, context?: string, meta?: LogMeta): void {
        this.write('info', message, context, meta);
    }

    warn(message: unknown, context?: string, meta?: LogMeta): void {
        this.write('warn', message, context, meta);
    }

    error(
        message: unknown,
        traceOrContext?: string,
        contextOrMeta?: string | LogMeta,
        meta?: LogMeta,
    ): void {
        if (typeof contextOrMeta === 'string') {
            this.write('error', message, contextOrMeta, {
                ...(meta ?? {}),
                trace: traceOrContext,
            });

            return;
        }

        this.write('error', message, traceOrContext, contextOrMeta);
    }

    debug(message: unknown, context?: string, meta?: LogMeta): void {
        this.write('debug', message, context, meta);
    }

    verbose(message: unknown, context?: string, meta?: LogMeta): void {
        this.write('verbose', message, context, meta);
    }

    private write(
        level: LogLevel,
        message: unknown,
        context?: string,
        meta: LogMeta = {},
    ): void {
        const requestId = getRequestId();

        const payload = {
            ...meta,
            context,
            level,
            message: this.normalizeMessage(message),
            requestId,
        };

        this.logger.log(level, payload);
    }

    private normalizeMessage(message: unknown): string {
        if (typeof message === 'string') {
            return message;
        }

        if (message instanceof Error) {
            return message.stack ?? message.message;
        }

        try {
            return JSON.stringify(message);
        } catch {
            return String(message);
        }
    }
}