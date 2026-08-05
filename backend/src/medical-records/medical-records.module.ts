import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessControlModule } from '../common/profanity/access-control/access-control.module';

@Module({
  imports: [PrismaModule, AccessControlModule],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
