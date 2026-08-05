-- CreateTable
CREATE TABLE "MedicalAttachment" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "medicalRecordId" INTEGER,
    "type" "AttachmentType" NOT NULL,
    "uploadedBy" "UploadedBy" NOT NULL,
    "fileName" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalAttachment_appointmentId_idx" ON "MedicalAttachment"("appointmentId");

-- CreateIndex
CREATE INDEX "MedicalAttachment_medicalRecordId_idx" ON "MedicalAttachment"("medicalRecordId");

-- AddForeignKey
ALTER TABLE "MedicalAttachment" ADD CONSTRAINT "MedicalAttachment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalAttachment" ADD CONSTRAINT "MedicalAttachment_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
