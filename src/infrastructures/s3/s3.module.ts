import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Service } from './s3.service';
import { S3_CLIENT } from './s3.constans';
import { LoggerModule } from '../logger/logger.module';


@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new S3Client({
          region: config.get<string>('s3.region')!,
          endpoint: config.get<string>('s3.endpoint')!,
          forcePathStyle: true,
          credentials: {
            accessKeyId: config.get<string>('s3.accessKey')!,
            secretAccessKey: config.get<string>('s3.secretKey')!,
          },
        });
      },
    },
    S3Service
  ],
  exports: [S3_CLIENT, S3Service],
})
export class S3Module { }
