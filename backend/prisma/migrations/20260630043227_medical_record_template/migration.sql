-- CreateEnum
CREATE TYPE "TemplateVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'CHECKBOX', 'SELECT', 'VITAL');

-- CreateTable
CREATE TABLE "MedicalRecordTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "specialty" TEXT,
    "visibility" "TemplateVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "doctorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecordTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecordTemplateItem" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT,
    "placeholder" TEXT,
    "options" JSONB,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "MedicalRecordTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalRecordTemplate_doctorId_idx" ON "MedicalRecordTemplate"("doctorId");

-- CreateIndex
CREATE INDEX "MedicalRecordTemplate_visibility_idx" ON "MedicalRecordTemplate"("visibility");

-- CreateIndex
CREATE INDEX "MedicalRecordTemplate_specialty_idx" ON "MedicalRecordTemplate"("specialty");

-- CreateIndex
CREATE INDEX "MedicalRecordTemplateItem_templateId_idx" ON "MedicalRecordTemplateItem"("templateId");

-- AddForeignKey
ALTER TABLE "MedicalRecordTemplate" ADD CONSTRAINT "MedicalRecordTemplate_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecordTemplateItem" ADD CONSTRAINT "MedicalRecordTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MedicalRecordTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
