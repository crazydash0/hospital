import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ClinicOwnerController } from './clinic-owner.controller';
import { ClinicOwnerService } from './clinic-owner.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController, ClinicOwnerController],
  providers: [DashboardService, ClinicOwnerService],
})
export class DashboardModule {}
