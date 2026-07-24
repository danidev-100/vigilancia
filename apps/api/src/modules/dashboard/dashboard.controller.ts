import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@vigilancia/shared';
import type { UserProfile } from '@vigilancia/shared';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN, Role.SECURITY_GUARD)
  async getStats(@CurrentUser() user: UserProfile) {
    const userId = user.role === Role.SECURITY_GUARD ? user.id : undefined;
    return this.dashboardService.getStats(userId);
  }
}
