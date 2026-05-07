import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';
import { createLoggerFormat, createLoggerTransports } from './logger.transports';

@Global()
@Module({
    imports: [
        WinstonModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    format: createLoggerFormat(),
                    transports: createLoggerTransports(configService)
                };
            },
        }),
    ],
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule { }
