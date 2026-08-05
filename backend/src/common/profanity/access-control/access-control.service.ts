import { Appointment, MedicalRecord, Review, Role } from '@prisma/client';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { JwtUser } from './type/jwt-user';
import { AppointmentStatus } from '@prisma/client';
@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}
  async verifyAppointmentAccess(
    appointmentId: number,
    currentUser: JwtUser,
  ): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (currentUser.role === Role.ADMIN) {
      return appointment;
    }

    if (currentUser.role === Role.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: {
          userId: currentUser.userId,
        },
      });

      if (!doctor || doctor.id !== appointment.doctorId) {
        throw new ForbiddenException('Access denied');
      }

      return appointment;
    }

    if (currentUser.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: {
          userId: currentUser.userId,
        },
      });

      if (!patient || patient.id !== appointment.patientId) {
        throw new ForbiddenException('Access denied');
      }

      return appointment;
    }

    throw new ForbiddenException();
  }
  async verifyDoctorAppointment(appointmentId: number, currentUser: JwtUser) {
    const appointment = await this.verifyAppointmentAccess(
      appointmentId,
      currentUser,
    );

    if (currentUser.role !== Role.DOCTOR && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Doctors only');
    }

    return appointment;
  }
  async verifyPatientAppointment(appointmentId: number, currentUser: JwtUser) {
    const appointment = await this.verifyAppointmentAccess(
      appointmentId,
      currentUser,
    );

    if (currentUser.role !== Role.PATIENT && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Patients only');
    }

    return appointment;
  }
  async verifyMedicalRecordAccess(
    medicalRecordId: number,
    currentUser: JwtUser,
  ): Promise<MedicalRecord> {
    const record = await this.prisma.medicalRecord.findUnique({
      where: {
        id: medicalRecordId,
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (currentUser.role === Role.ADMIN) {
      return record;
    }

    if (currentUser.role === Role.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: {
          userId: currentUser.userId,
        },
      });

      if (!doctor || doctor.id !== record.doctorId) {
        throw new ForbiddenException('Access denied');
      }

      return record;
    }

    if (currentUser.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: {
          userId: currentUser.userId,
        },
      });

      if (!patient || patient.id !== record.patientId) {
        throw new ForbiddenException('Access denied');
      }

      return record;
    }

    throw new ForbiddenException();
  }
  async verifyReviewAccess(
    reviewId: number,
    currentUser: JwtUser,
  ): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        doctor: true,
        patient: true,
        appointment: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (currentUser.role === Role.ADMIN) {
      return review;
    }

    if (currentUser.role === Role.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: {
          userId: currentUser.userId,
        },
      });

      if (!doctor || doctor.id !== review.doctorId) {
        throw new ForbiddenException('Access denied');
      }

      return review;
    }

    if (currentUser.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: {
          userId: currentUser.userId,
        },
      });

      if (!patient || patient.id !== review.patientId) {
        throw new ForbiddenException('Access denied');
      }

      return review;
    }

    throw new ForbiddenException();
  }
  async verifyPrescriptionAccess(prescriptionId: number, currentUser: JwtUser) {
    const prescription = await this.prisma.prescription.findUnique({
      where: {
        id: prescriptionId,
      },
      include: {
        medicalRecord: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    switch (currentUser.role) {
      case Role.ADMIN:
        return prescription;

      case Role.DOCTOR: {
        const doctor = await this.prisma.doctor.findUnique({
          where: {
            userId: currentUser.userId,
          },
        });

        if (!doctor) {
          throw new NotFoundException('Doctor not found');
        }

        if (prescription.medicalRecord.doctorId !== doctor.id) {
          throw new ForbiddenException('You cannot access this prescription');
        }

        return prescription;
      }

      case Role.PATIENT: {
        const patient = await this.prisma.patient.findUnique({
          where: {
            userId: currentUser.userId,
          },
        });

        if (!patient) {
          throw new NotFoundException('Patient not found');
        }

        if (prescription.medicalRecord.patientId !== patient.id) {
          throw new ForbiddenException('You cannot access this prescription');
        }

        return prescription;
      }

      default:
        throw new ForbiddenException('Access denied');
    }
  }
  async verifyDoctorPatientAccess(patientId: number, currentUser: JwtUser) {
    if (currentUser.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can access patient profiles');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId: currentUser.userId,
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

    const relation = await this.prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        patientId,
        status: AppointmentStatus.COMPLETED,
      },
    });

    if (!relation) {
      throw new BadRequestException('You have never treated this patient');
    }

    return patient;
  }
}
