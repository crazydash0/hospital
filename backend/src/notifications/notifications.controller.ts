import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Req() req: any) {
    return this.prisma.notification.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Patch('preferences')
  updatePreferences(@Req() req: any, @Body() body: { email?: boolean; sms?: boolean; inApp?: boolean; reminders?: boolean }) {
    return this.prisma.notificationPreference.upsert({
      where: { userId: req.user.userId },
      create: { userId: req.user.userId, email: body.email ?? true, sms: body.sms ?? true, inApp: body.inApp ?? true, reminders: body.reminders ?? true },
      update: { ...(body.email !== undefined ? { email: body.email } : {}), ...(body.sms !== undefined ? { sms: body.sms } : {}), ...(body.inApp !== undefined ? { inApp: body.inApp } : {}), ...(body.reminders !== undefined ? { reminders: body.reminders } : {}) },
    });
  }
}
