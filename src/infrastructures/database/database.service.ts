import { Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
    private readonly context = DatabaseService.name;

    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: LoggerService,
    ) { }

    onModuleInit() {
        try {
            this.logger.info('Connected database', this.context);
        } catch (err) {
            this.logger.error(err, this.context);
        }
    }

    onModuleDestroy() {
        try {
            this.logger.info('Closed database', this.context);
        } catch (err) {
            this.logger.error(err, this.context);
        }
    }

    async onApplicationShutdown() {
        try {
            await this.dataSource.destroy();
            this.logger.info('Database disconnected', this.context);
        } catch (err) {
            this.logger.error(err, this.context);
        }
    }
}
