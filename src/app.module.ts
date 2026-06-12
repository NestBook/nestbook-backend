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
import { UserModule } from './modules/user/user.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { ResourceModule } from './modules/resource/resource.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { RoomTypeModule } from './modules/room-type/room-type.module';
import { PublicHotelModule } from './modules/room-type/public-hotel.module';

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
    LoggerModule,
    UserModule,
    RoleModule,
    PermissionModule,
    ResourceModule,
    HotelModule,
    RoomTypeModule,
    PublicHotelModule
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
