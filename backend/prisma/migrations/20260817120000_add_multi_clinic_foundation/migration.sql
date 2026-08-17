-- Multi-clinic foundation. Existing clinic ownership columns are nullable so current data remains compatible.

CREATE TYPE "ClinicRole" AS ENUM ('OWNER', 'DOCTOR', 'RECEPTIONIST', 'STAFF');
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'REFUNDED', 'VOID');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'ONLINE');

CREATE TABLE "Clinic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Clinic_slug_key" ON "Clinic"("slug");
CREATE INDEX "Clinic_isActive_idx" ON "Clinic"("isActive");

CREATE TABLE "ClinicMembership" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "ClinicRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClinicMembership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClinicMembership_clinicId_userId_key" ON "ClinicMembership"("clinicId", "userId");
CREATE INDEX "ClinicMembership_userId_idx" ON "ClinicMembership"("userId");
CREATE INDEX "ClinicMembership_clinicId_role_idx" ON "ClinicMembership"("clinicId", "role");
ALTER TABLE "ClinicMembership" ADD CONSTRAINT "ClinicMembership_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicMembership" ADD CONSTRAINT "ClinicMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ClinicPatient" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClinicPatient_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClinicPatient_clinicId_patientId_key" ON "ClinicPatient"("clinicId", "patientId");
CREATE INDEX "ClinicPatient_patientId_idx" ON "ClinicPatient"("patientId");
ALTER TABLE "ClinicPatient" ADD CONSTRAINT "ClinicPatient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicPatient" ADD CONSTRAINT "ClinicPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Doctor" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "AppointmentSlot" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "MedicalRecord" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "MedicalRecordTemplate" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "Review" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "MedicalAttachment" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "WeeklyScheduleTemplate" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "DoctorLeave" ADD COLUMN "clinicId" INTEGER;

CREATE INDEX "Doctor_clinicId_idx" ON "Doctor"("clinicId");
CREATE INDEX "Appointment_clinicId_idx" ON "Appointment"("clinicId");
CREATE INDEX "Appointment_clinicId_date_idx" ON "Appointment"("clinicId", "date");
CREATE INDEX "AppointmentSlot_clinicId_startTime_idx" ON "AppointmentSlot"("clinicId", "startTime");
CREATE INDEX "MedicalRecord_clinicId_idx" ON "MedicalRecord"("clinicId");
CREATE INDEX "MedicalRecordTemplate_clinicId_idx" ON "MedicalRecordTemplate"("clinicId");
CREATE INDEX "Review_clinicId_idx" ON "Review"("clinicId");
CREATE INDEX "MedicalAttachment_clinicId_idx" ON "MedicalAttachment"("clinicId");
CREATE INDEX "WeeklyScheduleTemplate_clinicId_idx" ON "WeeklyScheduleTemplate"("clinicId");
CREATE INDEX "DoctorLeave_clinicId_idx" ON "DoctorLeave"("clinicId");

ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AppointmentSlot" ADD CONSTRAINT "AppointmentSlot_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MedicalRecordTemplate" ADD CONSTRAINT "MedicalRecordTemplate_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MedicalAttachment" ADD CONSTRAINT "MedicalAttachment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WeeklyScheduleTemplate" ADD CONSTRAINT "WeeklyScheduleTemplate_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DoctorLeave" ADD CONSTRAINT "DoctorLeave_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'NO_SHOW';

CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Payment_clinicId_paidAt_idx" ON "Payment"("clinicId", "paidAt");
CREATE INDEX "Payment_appointmentId_idx" ON "Payment"("appointmentId");
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
