import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AdminModule } from './admin/admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalAuthGuard } from './auth/global-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PatientsModule } from './patients/patients.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicalRecordTemplatesModule } from './medical-record-templates/medical-record-templates.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProfanityService } from './common/profanity/profanity.service';
import { ProfanityModule } from './common/profanity/profanity.module';
import { ModerationModule } from './common/profanity/moderation/moderation.module';
import { MedicalAttachmentsModule } from './medical-attachments/medical-attachments.module';
import { AccessControlModule } from './common/profanity/access-control/access-control.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [AuthModule, UsersModule, DoctorsModule, AppointmentsModule, AdminModule, DashboardModule, MedicalRecordsModule, PatientsModule, PrescriptionsModule, MedicalRecordTemplatesModule, ReviewsModule, ProfanityModule, ModerationModule, MedicalAttachmentsModule, AccessControlModule, PaymentsModule],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: GlobalAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    ProfanityService,
    AppService,
  ],
})
export class AppModule {}
