import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { LoggerModule } from 'src/infrastructures/logger/logger.module';
import { AUTH_REPOSITORY } from './repository/auth.repository.interface';
import { AuthRepository } from './repository/auth.repository';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    LoggerModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET as string || 'secret',
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400)
      },
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
  ],
  exports: [AuthService]
})
export class AuthModule { }
