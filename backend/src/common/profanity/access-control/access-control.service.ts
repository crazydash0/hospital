import { Appointment, MedicalRecord, Review, Role } from '@prisma/client';
import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtUser } from './type/jwt-user';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureClinicContext(user: JwtUser) { if (!user.clinicId) throw new ForbiddenException('Clinic context is required'); }

  async verifyAppointmentAccess(id: number, user: JwtUser): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id }, include: { doctor: true, patient: true } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (user.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId: user.userId } });
      if (!patient || patient.id !== appointment.patientId) throw new ForbiddenException('Access denied');
      return appointment;
    }
    this.ensureClinicContext(user);
    if (appointment.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
    if (user.role === Role.ADMIN) return appointment;
    if (user.role === Role.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId: user.userId } });
      if (!doctor || doctor.id !== appointment.doctorId || doctor.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
      return appointment;
    }
    throw new ForbiddenException();
  }

  async verifyDoctorAppointment(id: number, user: JwtUser) { const appointment = await this.verifyAppointmentAccess(id, user); if (user.role !== Role.DOCTOR && user.role !== Role.ADMIN) throw new ForbiddenException('Doctors only'); return appointment; }
  async verifyPatientAppointment(id: number, user: JwtUser) { const appointment = await this.verifyAppointmentAccess(id, user); if (user.role !== Role.PATIENT && user.role !== Role.ADMIN) throw new ForbiddenException('Patients only'); return appointment; }

  async verifyMedicalRecordAccess(id: number, user: JwtUser): Promise<MedicalRecord> {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id }, include: { doctor: true, patient: true } });
    if (!record) throw new NotFoundException('Medical record not found');
    if (user.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId: user.userId } });
      if (!patient || patient.id !== record.patientId) throw new ForbiddenException('Access denied');
      return record;
    }
    this.ensureClinicContext(user);
    if (record.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
    if (user.role === Role.ADMIN) return record;
    if (user.role === Role.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId: user.userId } });
      if (!doctor || doctor.id !== record.doctorId || doctor.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
      return record;
    }
    throw new ForbiddenException();
  }

  async verifyReviewAccess(id: number, user: JwtUser): Promise<Review> {
    const review = await this.prisma.review.findUnique({ where: { id }, include: { doctor: true, patient: true, appointment: true } });
    if (!review) throw new NotFoundException('Review not found');
    if (user.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId: user.userId } });
      if (!patient || patient.id !== review.patientId) throw new ForbiddenException('Access denied');
      return review;
    }
    this.ensureClinicContext(user);
    if (review.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
    if (user.role === Role.ADMIN) return review;
    if (user.role === Role.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId: user.userId } });
      if (!doctor || doctor.id !== review.doctorId || doctor.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
      return review;
    }
    throw new ForbiddenException();
  }

  async verifyPrescriptionAccess(id: number, user: JwtUser) {
    const prescription = await this.prisma.prescription.findUnique({ where: { id }, include: { medicalRecord: true } });
    if (!prescription) throw new NotFoundException('Prescription not found');
    if (user.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId: user.userId } });
      if (!patient || patient.id !== prescription.medicalRecord.patientId) throw new ForbiddenException('Access denied');
      return prescription;
    }
    this.ensureClinicContext(user);
    if (prescription.medicalRecord.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
    if (user.role === Role.ADMIN) return prescription;
    if (user.role === Role.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId: user.userId } });
      if (!doctor || doctor.id !== prescription.medicalRecord.doctorId || doctor.clinicId !== user.clinicId) throw new ForbiddenException('Access denied');
      return prescription;
    }
    throw new ForbiddenException('Access denied');
  }

  async verifyDoctorPatientAccess(patientId: number, user: JwtUser) {
    this.ensureClinicContext(user);
    if (user.role !== Role.DOCTOR) throw new ForbiddenException('Only doctors can access patient profiles');
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: user.userId } });
    if (!doctor || doctor.clinicId !== user.clinicId) throw new NotFoundException('Doctor not found');
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
    if (!patient) throw new NotFoundException('Patient not found');
    const relation = await this.prisma.appointment.findFirst({ where: { clinicId: user.clinicId, doctorId: doctor.id, patientId, status: AppointmentStatus.COMPLETED } });
    if (!relation) throw new BadRequestException('You have never treated this patient');
    return patient;
  }
}
