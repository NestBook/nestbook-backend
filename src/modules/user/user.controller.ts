import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { UserService } from './user.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetUserRoleDto } from './dto/set-user-role.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  findById(@Param('userId') userId: string) {
    return this.userService.findById(userId);
  }

  @Patch(':userId')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(userId, dto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  remove(@Param('userId') userId: string) {
    return this.userService.remove(userId);
  }

  @Put(':userId/roles')
  @HttpCode(HttpStatus.OK)
  setUserRoles(
    @Param('userId') userId: string,
    @Body() dto: SetUserRoleDto,
  ) {
    return this.userService.setUserRoles(userId, dto);
  }
}