import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constans';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    redis: Redis;
    private readonly context = RedisService.name;

    constructor(
        @Inject(REDIS_CLIENT)
        private readonly redisClient: Redis,
        private readonly logger: LoggerService,
    ) { }

    onModuleInit() {
        this.redis = this.redisClient;

        this.logger.info('Redis Connected', this.context);
    }
    onModuleDestroy() {
        void this.redis.quit();
        this.logger.info('Redis disconnected', this.context);
    }

    public async get(key: string): Promise<string | null> {
        return await this.exceptionWrapper(() => this.redis.get(key))
    }

    public async set(key: string, value: string): Promise<void> {
        await this.exceptionWrapper(() => this.redis.set(key, value))
    }

    public async del(key: string): Promise<void> {
        await this.exceptionWrapper(() => this.redis.del(key))
    }

    public async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
        await this.exceptionWrapper(() => this.redis.set(key, value, 'EX', ttl))
    }

    public async setnx(key: string, value: string): Promise<number> {
        return await this.exceptionWrapper(() => this.redis.setnx(key, value))
    }

    private async exceptionWrapper<T>(fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            this.logger.error(error, this.context);
            throw error;
        }
    }

}
