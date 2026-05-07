import { MiddlewareConsumer, Module, NestMiddleware, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import dbConfig from './config/db.config';
import { DatabaseModule } from './infrastructures/database/database.module';
import { S3Module } from './infrastructures/s3/s3.module';
import { RedisModule } from './infrastructures/redis/redis.module';
import { LoggerModule } from './infrastructures/logger/logger.module';
import s3Config from './config/s3.config';
import redisConfig from './config/redis.config';
import logConfig from './config/log.config';
import { RequestIdMiddleware } from './commons/middleware/request-id.middleware';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './commons/exception/global.exception';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, s3Config, redisConfig, logConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    S3Module,
    RedisModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(RequestIdMiddleware)
    .forRoutes('*');
  }
}
