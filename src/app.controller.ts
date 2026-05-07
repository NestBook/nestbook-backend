import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from './infrastructures/logger/logger.service';
import { SuccessResponse } from './commons/core/response/success/success.response';
import { OkResponse } from './commons/core/response/success/ok.response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly loggerService: LoggerService) { }

  @Get('health')
  getHello(): SuccessResponse<string> {
    this.loggerService.log('health check', 'AppController');
    const res = this.appService.healthCheck();
    return new OkResponse<string>(res, 'OK');
  }
}
