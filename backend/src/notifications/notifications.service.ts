import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppointmentStatus, NotificationChannel, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => this.processAppointmentReminders().catch((error) => this.logger.error(error)), 60_000);
    void this.processAppointmentReminders();
  }

  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async notifyUser(userId: number, type: NotificationType, title: string, body: string, appointmentId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { notificationPreference: true } });
    if (!user) return;
    const preference = user.notificationPreference ?? { email: true, sms: true, inApp: true, reminders: true };
    if (preference.inApp) await this.prisma.notification.create({ data: { userId, type, channel: NotificationChannel.IN_APP, title, body, appointmentId } });
    if (preference.email && user.email && user.emailVerifiedAt) {
      const sent = await this.sendEmail(user.email, title, body);
      if (sent) await this.recordDelivery(userId, type, NotificationChannel.EMAIL, title, body, appointmentId);
    }
    if (preference.sms && user.phone && user.phoneVerifiedAt) {
      const sent = await this.sendSms(user.phone, `${title}: ${body}`);
      if (sent) await this.recordDelivery(userId, type, NotificationChannel.SMS, title, body, appointmentId);
    }
  }

  async processAppointmentReminders() {
    const now = new Date();
    const from = new Date(now.getTime() + 59 * 60_000);
    const to = new Date(now.getTime() + 61 * 60_000);
    const appointments = await this.prisma.appointment.findMany({
      where: { date: { gte: from, lte: to }, status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }, reminder: null },
      include: { patient: { include: { user: true } }, doctor: true, clinic: true },
    });
    for (const appointment of appointments) {
      try { await this.prisma.appointmentReminder.create({ data: { appointmentId: appointment.id, scheduledFor: appointment.date } }); } catch { continue; }
      const preference = await this.prisma.notificationPreference.findUnique({ where: { userId: appointment.patient.userId } });
      if (preference?.reminders === false) continue;
      const body = `Your appointment with Dr. ${appointment.doctor.fullName} at ${appointment.clinic.name} is scheduled in about one hour.`;
      await this.notifyUser(appointment.patient.userId, NotificationType.APPOINTMENT_REMINDER, 'Appointment reminder', body, appointment.id);
    }
  }

  private async recordDelivery(userId: number, type: NotificationType, channel: NotificationChannel, title: string, body: string, appointmentId?: number) {
    await this.prisma.notification.create({ data: { userId, type, channel, title, body, sentAt: new Date(), appointmentId } });
  }

  private async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.NOTIFICATION_EMAIL_FROM;
    if (!apiKey || !from) { this.logger.warn('Email provider is not configured; skipping email delivery'); return false; }
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject, text }) });
    if (!response.ok) { this.logger.error(`Email delivery failed: ${response.status}`); return false; }
    return true;
  }

  private async sendSms(to: string, body: string): Promise<boolean> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from) { this.logger.warn('SMS provider is not configured; skipping SMS delivery'); return false; }
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const payload = new URLSearchParams({ To: to, From: from, Body: body });
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload });
    if (!response.ok) { this.logger.error(`SMS delivery failed: ${response.status}`); return false; }
    return true;
  }
}
