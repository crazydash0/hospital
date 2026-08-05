import { Module } from '@nestjs/common';
import { MedicalRecordTemplatesService } from './medical-record-templates.service';
import { MedicalRecordTemplatesController } from './medical-record-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [MedicalRecordTemplatesService],
  controllers: [MedicalRecordTemplatesController],
})
export class MedicalRecordTemplatesModule {}
