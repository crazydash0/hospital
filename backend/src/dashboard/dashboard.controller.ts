import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.DOCTOR)
  @Get('doctor')
  getDoctorDashboard(@Req() req) { return this.dashboardService.getDoctorDashboard(req.user.userId); }

  @Get('today')
  @Roles(Role.DOCTOR)
  getToday(@Req() req) { return this.dashboardService.getTodayAppointments(req.user.userId); }
}
