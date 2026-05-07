import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';

export function createLoggerTransports(configService: ConfigService) {
    const logsDir = configService.get<string>('log.outDir')!;
    return [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp(),
                winston.format.printf(({ context, level, message, timestamp, ...rest }) => {
                    const contextLabel = context ? ` [${String(context)}]` : '';
                    const meta = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
                    return `${timestamp} ${level}${contextLabel}: ${String(message)}${meta}`;
                }),
            ),
        }),
        new winston.transports.File({ filename: join(logsDir, 'combined.log') }),
        new winston.transports.File({ filename: join(logsDir, 'error.log'), level: 'error' }),
    ];
}

export function createLoggerFormat() {
    return winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json(),
    );
}