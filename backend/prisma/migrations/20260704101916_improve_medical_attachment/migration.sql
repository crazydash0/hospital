/*
  Warnings:

  - Added the required column `uploadedById` to the `MedicalAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedicalAttachment" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uploadedById" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "MedicalAttachment_uploadedById_idx" ON "MedicalAttachment"("uploadedById");

-- CreateIndex
CREATE INDEX "MedicalAttachment_isDeleted_idx" ON "MedicalAttachment"("isDeleted");

-- AddForeignKey
ALTER TABLE "MedicalAttachment" ADD CONSTRAINT "MedicalAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
