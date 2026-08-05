import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { AccessControlService } from '../common/profanity/access-control/access-control.service';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';
@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  async updatePrescription(
    currentUser: JwtUser,
    prescriptionId: number,
    dto: UpdatePrescriptionDto,
  ) {
    await this.accessControl.verifyPrescriptionAccess(
      prescriptionId,
      currentUser,
    );
    return this.prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: dto,
    });
  }

  async deletePrescription(currentUser: JwtUser, prescriptionId: number) {
    await this.accessControl.verifyPrescriptionAccess(
      prescriptionId,
      currentUser,
    );

    await this.prisma.prescription.delete({
      where: {
        id: prescriptionId,
      },
    });

    return {
      message: 'Prescription deleted successfully',
    };
  }
  async addPrescription(
    currentUser: JwtUser,
    medicalRecordId: number,
    dto: CreatePrescriptionDto,
  ) {
    const record = await this.accessControl.verifyMedicalRecordAccess(
      medicalRecordId,
      currentUser,
    );
    return this.prisma.prescription.create({
      data: {
        medicalRecordId: record.id,
        medicineName: dto.medicineName,
        dosage: dto.dosage,
        frequency: dto.frequency,
        duration: dto.duration,
        instructions: dto.instructions,
      },
    });
  }
}
