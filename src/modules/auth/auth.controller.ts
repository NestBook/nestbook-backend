import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AdminMfaVerifyDto } from './dto/admin-mfa-verify.dto';
import { ProviderLoginDto } from './dto/providers-login.dto';
import { Public } from 'src/commons/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }


  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin/mfa/verify')
  @HttpCode(HttpStatus.OK)
  verifyAdminMfa(@Body() dto: AdminMfaVerifyDto) {
    return this.authService.verifyAdminMfa(dto);
  }

  @Post('provider-login')
  @HttpCode(HttpStatus.OK)
  providerLogin(@Body() dto: ProviderLoginDto) {
    return this.authService.providerLogin(dto);
  }

  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  googleLogin(@Body() dto: ProviderLoginDto) {
    return this.authService.providerLogin(dto);
  }

  @Get('google')
  @HttpCode(HttpStatus.OK)
  googleLoginStart() {
    return {
      message: 'Google OAuth redirect flow is not implemented yet',
    };
  }

  @Get('google/callback')
  @HttpCode(HttpStatus.OK)
  googleCallback(@Query('code') code: string) {
    return {
      message: 'Google OAuth callback is not implemented yet',
      code
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  me() {
    return {
      message: 'Auth me is not implemented yet. Need JwtAuthGuard first.',
    };
  }
}