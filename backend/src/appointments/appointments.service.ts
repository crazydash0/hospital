import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { AccessControlService } from '../common/profanity/access-control/access-control.service';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';
import { ZoomService } from '../zoom/zoom.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly zoom: ZoomService,
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
        patient: {
          include: {
            user: { select: { email: true } },
          },
        },
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
        doctor: {
          include: {
            user: { select: { email: true } },
          },
        },
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

  // =========================
  // CANCEL (BY DOCTOR)
  // =========================
  async cancelAppointmentByDoctor(id: number, currentUser: JwtUser) {
    await this.accessControl.verifyDoctorAppointment(id, currentUser);

    return this.prisma.appointment.update({
      where: {
        id,
      },
      data: {
        status: AppointmentStatus.CANCELLED,
      },
    });
  }

  // =========================
  // SET / UPDATE ONLINE MEETING LINK
  // =========================
  async setMeetingLink(
    id: number,
    currentUser: JwtUser,
    meetingLink: string,
  ) {
    await this.accessControl.verifyDoctorAppointment(id, currentUser);

    return this.prisma.appointment.update({
      where: { id },
      data: { meetingLink },
    });
  }

  // توليد رابط Zoom تلقائيًا من غير ما الدكتور يسيب الصفحة
  async generateZoomMeetingLink(id: number, currentUser: JwtUser) {
    await this.accessControl.verifyDoctorAppointment(id, currentUser);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { slot: true, patient: true, doctor: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const meeting = await this.zoom.createMeeting({
      topic: `كشف مع د. ${appointment.doctor.fullName} - ${appointment.patient.fullName}`,
      startTime: appointment.slot.startTime,
      durationMinutes: Math.max(
        15,
        Math.round(
          (appointment.slot.endTime.getTime() -
            appointment.slot.startTime.getTime()) /
            60000,
        ),
      ),
    });

    return this.prisma.appointment.update({
      where: { id },
      data: { meetingLink: meeting.join_url },
    });
  }

  // إزالة رابط الجلسة (لو الدكتور غيّر رأيه أو الميعاد بقى حضوري)
  async removeMeetingLink(id: number, currentUser: JwtUser) {
    await this.accessControl.verifyDoctorAppointment(id, currentUser);

    return this.prisma.appointment.update({
      where: { id },
      data: { meetingLink: null },
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
 private buildSlotsForDay(
    doctorId: number,
    date: Date,
    startHour: number,
    endHour: number,
    duration: number,
  ) {
    const start = new Date(date);
    start.setHours(startHour, 0, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, 0, 0, 0);

    const slots: { doctorId: number; startTime: Date; endTime: Date }[] = [];

    while (start < end) {
      const slotStart = new Date(start);
      const slotEnd = new Date(start);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      slots.push({ doctorId, startTime: slotStart, endTime: slotEnd });
      start.setMinutes(start.getMinutes() + duration);
    }

    return slots;
  }

  async createSlots(
    doctorUserId: number,
    date: string,
    startHour: number,
    endHour: number,
    duration: number = 30,
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

    const existingSlots = await this.prisma.appointmentSlot.count({
      where: {
        doctorId: doctor.id,
        startTime: { gte: start, lt: end },
      },
    });

    if (existingSlots > 0) {
      throw new BadRequestException('Slots already exist for this date');
    }

    const slots = this.buildSlotsForDay(doctor.id, day, startHour, endHour, duration);

    return this.prisma.appointmentSlot.createMany({ data: slots });
  }
  // إنشاء أو تعديل يوم في الجدول الأسبوعي
  async setWeeklyTemplate(
    doctorUserId: number,
    dayOfWeek: number,
    startHour: number,
    endHour: number,
    duration: number,
    note?: string,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (endHour <= startHour) {
      throw new BadRequestException(
        'ساعة النهاية لازم تكون بعد ساعة البداية',
      );
    }

    return this.prisma.weeklyScheduleTemplate.upsert({
      where: {
        doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek },
      },
      update: { startHour, endHour, duration, note },
      create: {
        doctorId: doctor.id,
        dayOfWeek,
        startHour,
        endHour,
        duration,
        note,
      },
    });
  }

  // إنشاء نطاق من الأيام دفعة واحدة (مثال: من الأحد للثلاثاء)
  async setWeeklyRange(
    doctorUserId: number,
    fromDay: number,
    toDay: number,
    startHour: number,
    endHour: number,
    duration: number,
    note?: string,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (fromDay > toDay) {
      throw new BadRequestException(
        'يوم البداية لازم يكون قبل يوم النهاية (لا يدعم النطاق الملتف حاليًا)',
      );
    }

    if (endHour <= startHour) {
      throw new BadRequestException(
        'ساعة النهاية لازم تكون بعد ساعة البداية',
      );
    }

    const results: {
      id: number;
      doctorId: number;
      dayOfWeek: number;
      startHour: number;
      endHour: number;
      duration: number;
      note: string | null;
    }[] = [];
    for (let day = fromDay; day <= toDay; day++) {
      const result = await this.prisma.weeklyScheduleTemplate.upsert({
        where: {
          doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek: day },
        },
        update: { startHour, endHour, duration, note },
        create: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startHour,
          endHour,
          duration,
          note,
        },
      });
      results.push(result);
    }

    return results;
  }

  // حذف يوم بالكامل من الجدول الأسبوعي
  async deleteWeeklyTemplateDay(doctorUserId: number, dayOfWeek: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const existing = await this.prisma.weeklyScheduleTemplate.findUnique({
      where: {
        doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek },
      },
    });

    if (!existing) {
      throw new NotFoundException('لا يوجد جدول لهذا اليوم أصلًا');
    }

    await this.prisma.weeklyScheduleTemplate.delete({
      where: { id: existing.id },
    });

    return { message: 'تم حذف اليوم من الجدول' };
  }

  // عرض الجدول الأسبوعي الحالي
  async getWeeklyTemplate(doctorUserId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.weeklyScheduleTemplate.findMany({
      where: { doctorId: doctor.id },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // عرض الجدول الأسبوعي لدكتور معين (متاح للمريض عشان يشوفه قبل الحجز)
  async getPublicWeeklyTemplate(doctorId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.weeklyScheduleTemplate.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // تسجيل يوم إجازة
  async addLeave(doctorUserId: number, date: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    try {
      return await this.prisma.doctorLeave.create({
        data: { doctorId: doctor.id, date: new Date(date) },
      });
    } catch (error) {
      throw new BadRequestException('Leave already registered for this date');
    }
  }

  // عرض أيام الإجازة القادمة
  async getLeaves(doctorUserId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.doctorLeave.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      orderBy: { date: 'asc' },
    });
  }

  // حذف يوم إجازة (التراجع عنه)
  async removeLeave(doctorUserId: number, leaveId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const leave = await this.prisma.doctorLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave || leave.doctorId !== doctor.id) {
      throw new NotFoundException('Leave not found');
    }

    await this.prisma.doctorLeave.delete({ where: { id: leaveId } });

    return { message: 'تم حذف يوم الإجازة' };
  }

  // توليد مواعيد الأسبوع الجاي حسب الجدول الأسبوعي، مع تخطي الإجازات
  async generateWeek(doctorUserId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const templates = await this.prisma.weeklyScheduleTemplate.findMany({
      where: { doctorId: doctor.id },
    });

    const leaves = await this.prisma.doctorLeave.findMany({
      where: { doctorId: doctor.id },
    });

    const leaveDates = new Set(
      leaves.map((leave) => leave.date.toISOString().split('T')[0]),
    );

    let totalCreated = 0;
    const skippedDays: string[] = [];

    for (let i = 1; i <= 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() + i);
      day.setHours(0, 0, 0, 0);

      const dayOfWeek = day.getDay();
      const dateKey = day.toISOString().split('T')[0];

      const template = templates.find((t) => t.dayOfWeek === dayOfWeek);

      if (!template) continue;

      if (leaveDates.has(dateKey)) {
        skippedDays.push(dateKey);
        continue;
      }

      const dayStart = new Date(day);
      dayStart.setHours(template.startHour, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(template.endHour, 0, 0, 0);

      const existing = await this.prisma.appointmentSlot.count({
        where: {
          doctorId: doctor.id,
          startTime: { gte: dayStart, lt: dayEnd },
        },
      });

      if (existing > 0) continue;

      const slots = this.buildSlotsForDay(
        doctor.id,
        day,
        template.startHour,
        template.endHour,
        template.duration,
      );

      const result = await this.prisma.appointmentSlot.createMany({ data: slots });
      totalCreated += result.count;
    }

    return { totalCreated, skippedDays };
  }
}
