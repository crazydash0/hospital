import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, ClinicRole, PaymentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';
import { CreatePaymentDto } from './payments.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private clinicId(user: JwtUser) {
    if (!user.clinicId) throw new ForbiddenException('Clinic context is required');
    if (user.role !== Role.ADMIN && user.clinicRole !== ClinicRole.OWNER && user.clinicRole !== ClinicRole.RECEPTIONIST && user.clinicRole !== ClinicRole.DOCTOR) {
      throw new ForbiddenException('Payment access denied');
    }
    return user.clinicId;
  }

  async create(dto: CreatePaymentDto, user: JwtUser) {
    const clinicId = this.clinicId(user);
    const appointment = await this.prisma.appointment.findFirst({ where: { id: dto.appointmentId, clinicId }, include: { doctor: true, clinic: true } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.NO_SHOW) {
      throw new BadRequestException('Cannot record payment for a cancelled or no-show appointment');
    }
    if (dto.amount <= 0 || !Number.isFinite(dto.amount)) throw new BadRequestException('Invalid payment amount');
    return this.prisma.payment.create({ data: { clinicId, appointmentId: appointment.id, amount: dto.amount, method: dto.method, reference: dto.reference?.trim() || undefined, status: PaymentStatus.PAID } });
  }

  async listForAppointment(appointmentId: number, user: JwtUser) {
    const clinicId = this.clinicId(user);
    const appointment = await this.prisma.appointment.findFirst({ where: { id: appointmentId, clinicId } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return this.prisma.payment.findMany({ where: { appointmentId, clinicId }, orderBy: { createdAt: 'desc' } });
  }

  async refund(id: number, user: JwtUser) {
    const clinicId = this.clinicId(user);
    const payment = await this.prisma.payment.findFirst({ where: { id, clinicId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.PAID) throw new BadRequestException('Only paid payments can be refunded');
    return this.prisma.payment.update({ where: { id }, data: { status: PaymentStatus.REFUNDED } });
  }

  async void(id: number, user: JwtUser) {
    const clinicId = this.clinicId(user);
    const payment = await this.prisma.payment.findFirst({ where: { id, clinicId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.PAID) throw new BadRequestException('Only paid payments can be voided');
    return this.prisma.payment.update({ where: { id }, data: { status: PaymentStatus.VOID } });
  }
}
