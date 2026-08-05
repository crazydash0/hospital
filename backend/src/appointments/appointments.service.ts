import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { AccessControlService } from '../common/profanity/access-control/access-control.service';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  // =========================
  // BOOK APPOINTMENT
  // =========================
  async bookAppointment(patientUserId: number, slotId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.isBooked) {
      throw new BadRequestException('Slot already booked');
    }

    if (slot.startTime < new Date()) {
      throw new BadRequestException('Cannot book past appointments');
    }
    // منع الحجز مع دكتورين في نفس الوقت
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        date: slot.startTime,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'You already have an appointment at this time',
      );
    }

    // حجز الـ Slot
    await this.prisma.appointmentSlot.update({
      where: { id: slotId },
      data: {
        isBooked: true,
      },
    });

    return this.prisma.appointment.create({
      data: {
        doctorId: slot.doctorId,
        patientId: patient.id,
        slotId: slot.id,
        date: slot.startTime,
        status: AppointmentStatus.PENDING,
      },
      include: {
        doctor: true,
        patient: true,
        slot: true,
      },
    });
  }

  // =========================
  // DOCTOR APPOINTMENTS
  // =========================
  async getDoctorAppointments(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: true,
        slot: true,
      },
    });
  }

  // =========================
  // PATIENT APPOINTMENTS
  // =========================
  async getPatientAppointments(userId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: true,
        slot: true,
      },
    });
  }

  // =========================
  // CONFIRM
  // =========================
  async confirmAppointment(appointmentId: number, currentUser: JwtUser) {
    const appointment = await this.accessControl.verifyDoctorAppointment(
      appointmentId,
      currentUser,
    );
    await this.accessControl.verifyDoctorAppointment(
      appointmentId,
      currentUser,
    );

    return this.prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: AppointmentStatus.CONFIRMED,
      },
    });
  }
  // =========================
  // COMPLETE
  // =========================
  async completeAppointment(id: number, currentUser: JwtUser) {
    await this.accessControl.verifyDoctorAppointment(id, currentUser);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.COMPLETED,
      },
    });
  }

  // =========================
  // CANCEL
  // =========================
  async cancelAppointment(id: number, currentUser: JwtUser) {
    await this.accessControl.verifyPatientAppointment(id, currentUser);

    return this.prisma.appointment.update({
      where: {
        id,
      },
      data: {
        status: AppointmentStatus.CANCELLED,
      },
    });
  }
  async getAvailableSlots(doctorId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.appointmentSlot.findMany({
      where: {
        doctorId,
        isBooked: false,

        // إظهار المواعيد القادمة فقط
        startTime: {
          gt: new Date(),
        },
      },

      orderBy: {
        startTime: 'asc',
      },
    });
  }
  async createSlots(
    doctorUserId: number,
    date: string,
    startHour: number,
    endHour: number,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const day = new Date(date);

    const start = new Date(day);
    start.setHours(startHour, 0, 0, 0);

    const end = new Date(day);
    end.setHours(endHour, 0, 0, 0);

    // منع إنشاء Slots لنفس اليوم مرتين
    const existingSlots = await this.prisma.appointmentSlot.count({
      where: {
        doctorId: doctor.id,
        startTime: {
          gte: start,
          lt: end,
        },
      },
    });

    if (existingSlots > 0) {
      throw new BadRequestException('Slots already exist for this date');
    }
    const slots: {
      doctorId: number;
      startTime: Date;
      endTime: Date;
    }[] = [];

    while (start < end) {
      const slotStart = new Date(start);

      const slotEnd = new Date(start);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      slots.push({
        doctorId: doctor.id,
        startTime: slotStart,
        endTime: slotEnd,
      });

      start.setMinutes(start.getMinutes() + 30);
    }

    return this.prisma.appointmentSlot.createMany({
      data: slots,
    });
  }
}
