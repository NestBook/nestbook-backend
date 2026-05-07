import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constans';
import { LoggerService } from '../logger/logger.service';
import { LoggerModule } from '../logger/logger.module';


@Global()
@Module({
    imports: [ConfigModule, LoggerModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService, LoggerService],
            useFactory: (config: ConfigService, logger: LoggerService) => {
                const client = new Redis({
                    host: config.get<string>('redis.host'),
                    port: config.get<number>('redis.port'),
                    username: config.get<string>('redis.username') || undefined,
                    password: config.get<string>('redis.password') || undefined,
                    retryStrategy: (times) => {
                        return Math.min(times * 50, 2000);
                    },
                });

                client.on('connect', () => {
                    logger.info('Redis connecting...', RedisModule.name);
                });

                client.on('ready', () => {
                    logger.info('Redis connected', RedisModule.name);
                });

                client.on('error', (err) => {
                    logger.error('Redis error', RedisModule.name, {
                        error: err.message,
                    });
                });

                return client;
            },
        },
        RedisService
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }
