import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { loggerContext } from 'src/infrastructures/logger/logger.context';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    req.headers['x-request-id'] = requestId;
    loggerContext.run({ requestId }, () => {
      next();
    });
  }
} 
