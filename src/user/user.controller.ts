import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('keycloak')) // Protect all user routes with authentication
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles('user')
  async getCurrentUser(@Req() req): Promise<User> {
    return req.user;
  }
}
