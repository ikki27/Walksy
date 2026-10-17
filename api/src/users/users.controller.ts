import { Body, Controller, Get, Patch } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { toPublicUser } from './user.mapper';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me → the logged-in user
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return toPublicUser(await this.usersService.getById(user.id));
  }

  // PATCH /users/me → language, companion name, accessibility needs (+ consent)
  @Patch('me')
  async updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return toPublicUser(await this.usersService.updateProfile(user.id, dto));
  }
}
