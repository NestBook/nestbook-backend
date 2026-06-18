import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../../commons/decorators/public.decorator';
import { UnauthorizedError } from 'src/commons/core/response/error/unauthorized.error';
import { LoggerService } from 'src/infrastructures/logger/logger.service';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedError('Missing access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      request.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authorization = request.headers?.authorization;

    if (!authorization) {
      throw new UnauthorizedError('Missing access token');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedError('Invalid access token');
    }

    return token;
  }
}