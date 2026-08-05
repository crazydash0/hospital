/*
  Warnings:

  - A unique constraint covering the columns `[slotId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slotId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AppointmentSlot" DROP CONSTRAINT "AppointmentSlot_doctorId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "slotId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_slotId_key" ON "Appointment"("slotId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AppointmentSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentSlot" ADD CONSTRAINT "AppointmentSlot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
