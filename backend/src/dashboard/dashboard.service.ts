import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDoctorDashboard(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const totalAppointments = await this.prisma.appointment.count({
      where: {
        doctorId: doctor.id,
      },
    });

    const pendingAppointments = await this.prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        status: AppointmentStatus.PENDING,
      },
    });

    const confirmedAppointments = await this.prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        status: AppointmentStatus.CONFIRMED,
      },
    });

    const completedAppointments = await this.prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        status: AppointmentStatus.COMPLETED,
      },
    });

    const cancelledAppointments = await this.prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        status: AppointmentStatus.CANCELLED,
      },
    });

    return {
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
    };
  }
  async getTodayAppointments(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        patient: true,
        slot: true,
        medicalRecord: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
