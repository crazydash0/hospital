import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { AppointmentStatus, Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/profanity/access-control/access-control.service';

import { JwtUser } from '../common/profanity/access-control/type/jwt-user';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { GetMedicalRecordsDto } from './dto/get-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  // Doctor creates medical record
  async createRecord(currentUser: JwtUser, dto: CreateMedicalRecordDto) {
    if (currentUser.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can create medical records');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId: currentUser.userId,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointment = await this.accessControl.verifyAppointmentAccess(
      dto.appointmentId!,
      currentUser,
    );

    return this.prisma.medicalRecord.create({
      data: {
        appointmentId: appointment.id,
        doctorId: doctor.id,
        patientId: appointment.patientId,

        diagnosis: dto.diagnosis,
        notes: dto.notes,
        additionalInstructions: dto.additionalInstructions,

        prescriptions: {
          create: dto.prescriptions,
        },
      },

      include: {
        prescriptions: true,
      },
    });
  }

  // Patient views his records
  async getPatientRecords(userId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.medicalRecord.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },

        prescriptions: true,

        appointment: {
          select: {
            date: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async getRecord(id: number) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },

        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },

        appointment: true,

        prescriptions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    return record;
  }

  async getRecordById(currentUser: JwtUser, recordId: number) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: {
        id: recordId,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        appointment: true,
        prescriptions: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    await this.accessControl.verifyMedicalRecordAccess(recordId, currentUser);

    return record;
  }

  async getDoctorRecords(doctorUserId: number, query: GetMedicalRecordsDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId: doctorUserId,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const skip = (query.page - 1) * query.limit;

    const where = {
      doctorId: doctor.id,

      ...(query.diagnosis && {
        diagnosis: {
          contains: query.diagnosis,
          mode: 'insensitive' as const,
        },
      }),
    };
    const total = await this.prisma.medicalRecord.count({
      where,
    });
    const records = await this.prisma.medicalRecord.findMany({
      where,

      include: {
        patient: {
          include: {
            user: true,
          },
        },
        prescriptions: true,
        appointment: true,
      },

      orderBy: {
        createdAt: 'desc',
      },

      skip,

      take: query.limit,
    });
    return {
      data: records,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
    };
  }
  async getPatientHistory(doctorUserId: number, patientId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId: doctorUserId,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const patient = await this.prisma.patient.findUnique({
      where: {
        id: patientId,
      },
      include: {
        user: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    const hasRelationship = await this.prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        patientId,
        status: AppointmentStatus.COMPLETED,
      },
    });

    if (!hasRelationship) {
      throw new BadRequestException('You have never treated this patient');
    }
    const history = await this.prisma.medicalRecord.findMany({
      where: {
        patientId,
      },

      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            status: true,
          },
        },

        doctor: {
          select: {
            id: true,
            specialty: true,
            price: true,
            bio: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },

        prescriptions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      patient: {
        id: patient.id,
        email: patient.user.email,
      },

      totalVisits: history.length,

      history,
    };
  }
  async updateRecord(
    currentUser: JwtUser,
    recordId: number,
    dto: UpdateMedicalRecordDto,
  ) {
    await this.accessControl.verifyMedicalRecordAccess(recordId, currentUser);

    return this.prisma.medicalRecord.update({
      where: {
        id: recordId,
      },
      data: {
        diagnosis: dto.diagnosis,
        notes: dto.notes,
        additionalInstructions: dto.additionalInstructions,

        prescriptions: {
          create: dto.prescriptions,
        },
      },
      include: {
        prescriptions: true,
      },
    });
  }
}
