import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AppointmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/profanity/access-control/access-control.service';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { GetMedicalRecordsDto } from './dto/get-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService, private readonly accessControl: AccessControlService) {}

  async createRecord(currentUser: JwtUser, dto: CreateMedicalRecordDto) {
    if (currentUser.role !== Role.DOCTOR) throw new ForbiddenException('Only doctors can create medical records');
    const doctor = await this.prisma.doctor.findFirst({ where: { userId: currentUser.userId, clinicId: currentUser.clinicId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    const appointment = await this.accessControl.verifyAppointmentAccess(dto.appointmentId!, currentUser);
    if (appointment.doctorId !== doctor.id || appointment.status !== AppointmentStatus.COMPLETED) throw new BadRequestException('Medical records can only be created for your completed appointments');
    return this.prisma.medicalRecord.create({ data: { clinicId: appointment.clinicId, appointmentId: appointment.id, doctorId: doctor.id, patientId: appointment.patientId, diagnosis: dto.diagnosis, notes: dto.notes, additionalInstructions: dto.additionalInstructions, prescriptions: { create: dto.prescriptions } }, include: { prescriptions: true } });
  }

  async getPatientRecords(userId: number) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.prisma.medicalRecord.findMany({ where: { patientId: patient.id }, include: { clinic: { select: { id: true, name: true, slug: true } }, doctor: { include: { clinic: { select: { id: true, name: true, slug: true } }, user: { select: { email: true } } } }, prescriptions: true, appointment: { select: { date: true, status: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async getRecordById(currentUser: JwtUser, recordId: number) { const record = await this.accessControl.verifyMedicalRecordAccess(recordId, currentUser); return this.prisma.medicalRecord.findUniqueOrThrow({ where: { id: record.id }, include: { clinic: { select: { id: true, name: true, slug: true } }, doctor: { include: { user: { select: { email: true } } } }, patient: { include: { user: { select: { email: true } } } }, appointment: true, prescriptions: { orderBy: { createdAt: 'asc' } } } }); }

  async getDoctorRecords(doctorUserId: number, query: GetMedicalRecordsDto, user: JwtUser) {
    const doctor = await this.prisma.doctor.findFirst({ where: { userId: doctorUserId, clinicId: user.clinicId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    const skip = (query.page - 1) * query.limit;
    const where = { clinicId: user.clinicId, doctorId: doctor.id, ...(query.diagnosis ? { diagnosis: { contains: query.diagnosis, mode: 'insensitive' as const } } : {}) };
    const [total, records] = await Promise.all([this.prisma.medicalRecord.count({ where }), this.prisma.medicalRecord.findMany({ where, include: { patient: { include: { user: true } }, prescriptions: true, appointment: true }, orderBy: { createdAt: 'desc' }, skip, take: query.limit })]);
    return { data: records, meta: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) } };
  }

  async getPatientHistory(doctorUserId: number, patientId: number, user: JwtUser) {
    const doctor = await this.prisma.doctor.findFirst({ where: { userId: doctorUserId, clinicId: user.clinicId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
    if (!patient) throw new NotFoundException('Patient not found');
    const hasRelationship = await this.prisma.appointment.findFirst({ where: { clinicId: user.clinicId, doctorId: doctor.id, patientId, status: AppointmentStatus.COMPLETED } });
    if (!hasRelationship) throw new BadRequestException('You have never treated this patient');
    const history = await this.prisma.medicalRecord.findMany({ where: { clinicId: user.clinicId, patientId }, include: { appointment: { select: { id: true, date: true, status: true } }, doctor: { select: { id: true, specialty: true, price: true, bio: true, user: { select: { email: true } } } }, prescriptions: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } });
    return { patient: { id: patient.id, email: patient.user.email }, totalVisits: history.length, history };
  }

  async updateRecord(currentUser: JwtUser, recordId: number, dto: UpdateMedicalRecordDto) { const record = await this.accessControl.verifyMedicalRecordAccess(recordId, currentUser); return this.prisma.medicalRecord.update({ where: { id: record.id }, data: { diagnosis: dto.diagnosis, notes: dto.notes, additionalInstructions: dto.additionalInstructions, prescriptions: { create: dto.prescriptions } }, include: { prescriptions: true } }); }
}
