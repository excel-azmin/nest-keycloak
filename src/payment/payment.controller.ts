import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import { UserService } from '../user/user.service';

@Controller('payment')
@UseGuards(AuthGuard('keycloak'), RolesGuard)
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
  ) {}

  @Post('upgrade')
  @Roles('user')
  async upgradeAccount(@Req() req) {
    await this.paymentService.upgradeToPaidUser(req.user.keycloakId);
    const updatedUser = await this.userService.updateRoles(
      req.user.keycloakId,
      [...req.user.roles, 'paid_user']
    );
    return { message: 'Account upgraded successfully', user: updatedUser };
  }
}