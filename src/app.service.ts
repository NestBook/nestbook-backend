import { Injectable } from '@nestjs/common';
import { LoggerService } from './infrastructures/logger/logger.service';
import { BadRequestError } from './commons/core/response/error/badrequest.error';
import { ConflictError } from './commons/core/response/error/conflict.error';

@Injectable()
export class AppService {
  constructor(private readonly loggerService: LoggerService) { }
  healthCheck() {
    this.loggerService.info('health check', 'AppService');
    return 'ok'
  }
}
