import { Injectable } from '@nestjs/common';

import { AttachmentType, UploadedBy, Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { CreateMedicalAttachmentDto } from './dto/create-medical-attachment.dto';

import { AccessControlService } from '../common/profanity/access-control/access-control.service';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';

@Injectable()
export class MedicalAttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly accessControl: AccessControlService,
  ) {}

  async upload(
    dto: CreateMedicalAttachmentDto,
    file: Express.Multer.File,
    currentUser: JwtUser,
  ) {
    await this.accessControl.verifyAppointmentAccess(
      dto.appointmentId,
      currentUser,
    );

    const uploadedBy =
      currentUser.role === Role.DOCTOR ? UploadedBy.DOCTOR : UploadedBy.PATIENT;

    const uploaded = await this.cloudinary.uploadMedicalFile(
      file,
      this.getFolder(dto.type),
    );

    return this.prisma.medicalAttachment.create({
      data: {
        appointmentId: dto.appointmentId,
        medicalRecordId: dto.medicalRecordId,

        uploadedById: currentUser.userId,
        uploadedBy,

        type: dto.type,

        fileName: file.originalname,
        publicId: uploaded.public_id,
        fileUrl: uploaded.secure_url,
        mimeType: file.mimetype,
        size: file.size,
        notes: dto.notes,
      },
    });
  }
  private getFolder(type: AttachmentType): string {
    switch (type) {
      case AttachmentType.XRAY:
        return 'medical/xray';

      case AttachmentType.MRI:
        return 'medical/mri';

      case AttachmentType.CT_SCAN:
        return 'medical/ct-scan';

      case AttachmentType.LAB_RESULT:
        return 'medical/lab-results';

      case AttachmentType.PRESCRIPTION:
        return 'medical/prescriptions';

      case AttachmentType.REPORT:
        return 'medical/reports';

      case AttachmentType.ULTRASOUND:
        return 'medical/ultrasound';

      default:
        return 'medical/other';
    }
  }
}
