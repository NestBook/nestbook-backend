import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './infrastructures/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);

  app.setGlobalPrefix('api/v1');

  app.enableCors(configService.get('app.cors'));

  const port = configService.get<number>('app.port') ?? 3000;

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
