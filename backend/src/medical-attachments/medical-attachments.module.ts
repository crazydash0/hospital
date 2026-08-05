import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

import { MedicalAttachmentsController } from './medical-attachments.controller';
import { MedicalAttachmentsService } from './medical-attachments.service';
import { AccessControlModule } from '../common/profanity/access-control/access-control.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, AccessControlModule, AuthModule],
  controllers: [MedicalAttachmentsController],
  providers: [MedicalAttachmentsService],
})
export class MedicalAttachmentsModule {}
