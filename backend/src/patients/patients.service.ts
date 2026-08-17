import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';
import { AccessControlService } from '../common/profanity/access-control/access-control.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService, private readonly accessControl: AccessControlService) {}

  async getProfile(currentUser: JwtUser, patientId: number) {
    const patient = await this.accessControl.verifyDoctorPatientAccess(patientId, currentUser);
    const [appointments, medicalRecords, nextAppointment, lastAppointment] = await Promise.all([
      this.prisma.appointment.findMany({ where: { clinicId: currentUser.clinicId, patientId, doctor: { clinicId: currentUser.clinicId } }, include: { doctor: { include: { clinic: true } }, slot: true }, orderBy: { date: 'desc' } }),
      this.prisma.medicalRecord.findMany({ where: { clinicId: currentUser.clinicId, patientId, doctor: { clinicId: currentUser.clinicId } }, include: { doctor: true, appointment: true, prescriptions: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.appointment.findFirst({ where: { clinicId: currentUser.clinicId, patientId, date: { gt: new Date() }, status: AppointmentStatus.CONFIRMED }, include: { doctor: true, slot: true }, orderBy: { date: 'asc' } }),
      this.prisma.appointment.findFirst({ where: { clinicId: currentUser.clinicId, patientId, status: AppointmentStatus.COMPLETED }, include: { doctor: true }, orderBy: { date: 'desc' } }),
    ]);
    return {
      patient: { id: patient.id, email: patient.user.email, fullName: patient.fullName, phone: patient.phone, gender: patient.gender, birthDate: patient.birthDate, address: patient.address },
      statistics: { totalAppointments: appointments.length, completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length, pending: appointments.filter(a => a.status === AppointmentStatus.PENDING).length, cancelled: appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length, medicalRecords: medicalRecords.length },
      nextAppointment, lastAppointment, history: medicalRecords,
    };
  }

  async updateProfile(userId: number, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.prisma.patient.update({ where: { id: patient.id }, data: { fullName: dto.fullName, phone: dto.phone, gender: dto.gender, birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined, address: dto.address } });
  }

  async getMyProfile(userId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { userId }, include: { user: true, appointments: true, medicalRecords: true } });
    if (!patient) throw new NotFoundException('Patient not found');
    return { id: patient.id, email: patient.user.email, fullName: patient.fullName, phone: patient.phone, gender: patient.gender, birthDate: patient.birthDate, address: patient.address, statistics: { totalAppointments: patient.appointments.length, completed: patient.appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length, pending: patient.appointments.filter(a => a.status === AppointmentStatus.PENDING).length, cancelled: patient.appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length, medicalRecords: patient.medicalRecords.length } };
  }

  async getDoctorPatients(userId: number, user: JwtUser) {
    if (!user.clinicId) throw new BadRequestException('Clinic context is required');
    const doctor = await this.prisma.doctor.findFirst({ where: { userId, clinicId: user.clinicId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    const appointments = await this.prisma.appointment.findMany({ where: { clinicId: user.clinicId, doctorId: doctor.id }, include: { patient: { include: { user: true } } }, orderBy: { date: 'desc' } });
    const patients = new Map<number, typeof appointments[number]['patient']>();
    appointments.forEach(a => patients.set(a.patient.id, a.patient));
    return [...patients.values()];
  }
}
