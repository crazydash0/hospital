/*
  Warnings:

  - Made the column `appointmentId` on table `MedicalRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_appointmentId_fkey";

-- DropIndex
DROP INDEX "Appointment_date_idx";

-- AlterTable
ALTER TABLE "MedicalRecord" ALTER COLUMN "appointmentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
