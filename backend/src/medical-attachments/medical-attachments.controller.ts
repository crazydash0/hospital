import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { JwtUser } from '../common/profanity/access-control/type/jwt-user';

import { MedicalAttachmentsService } from './medical-attachments.service';
import { CreateMedicalAttachmentDto } from './dto/create-medical-attachment.dto';

interface AuthRequest extends Request {
  user: JwtUser;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'image/DICOM',
];

const MAX_FILE_SIZE_BYTES = 40 * 1024 * 1024; // 40MB
@ApiTags('Medical Attachments')
@ApiBearerAuth()
@Controller('medical-attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalAttachmentsController {
  constructor(
    private readonly medicalAttachmentsService: MedicalAttachmentsService,
  ) {}

  @Roles(Role.DOCTOR, Role.PATIENT)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPEG, PNG, WEBP images or PDF files are allowed',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  upload(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMedicalAttachmentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.medicalAttachmentsService.upload(dto, file, req.user);
  }
}