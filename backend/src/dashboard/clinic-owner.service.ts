import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, ClinicRole } from '@prisma/client';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';

@Injectable()
export class ClinicOwnerService {
  constructor(private readonly prisma: PrismaService) {}

  private clinic(user: JwtUser) {
    if (!user.clinicId || user.clinicRole !== ClinicRole.OWNER) throw new ForbiddenException('Clinic owner access required');
    return user.clinicId;
  }

  async summary(user: JwtUser) {
    const clinicId = this.clinic(user);
    const [clinic, doctors, patients, appointments, today, completed, pending, revenue] = await Promise.all([
      this.prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true, name: true, slug: true, logoUrl: true, phone: true, address: true, isActive: true } }),
      this.prisma.doctor.findMany({ where: { clinicId }, orderBy: { fullName: 'asc' } }),
      this.prisma.clinicPatient.count({ where: { clinicId } }),
      this.prisma.appointment.count({ where: { clinicId } }),
      this.prisma.appointment.count({ where: { clinicId, date: { gte: new Date(new Date().setHours(0,0,0,0)), lt: new Date(new Date().setHours(24,0,0,0)) } } }),
      this.prisma.appointment.count({ where: { clinicId, status: AppointmentStatus.COMPLETED } }),
      this.prisma.appointment.count({ where: { clinicId, status: AppointmentStatus.PENDING } }),
      this.prisma.payment.aggregate({ where: { clinicId, status: 'PAID' }, _sum: { amount: true } }),
    ]);
    if (!clinic) throw new NotFoundException('Clinic not found');
    return { clinic, doctors, patients, appointments, todayAppointments: today, completedAppointments: completed, pendingAppointments: pending, revenue: revenue._sum.amount ?? 0 };
  }
}
