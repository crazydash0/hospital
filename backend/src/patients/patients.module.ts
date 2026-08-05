import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessControlModule } from '../common/profanity/access-control/access-control.module';
@Module({
  imports: [PrismaModule, AccessControlModule],
  providers: [PatientsService],
  controllers: [PatientsController],
})
export class PatientsModule {}
