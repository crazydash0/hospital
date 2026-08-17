-- Backfill a clinic for legacy doctor profiles that predate multi-clinic support.
INSERT INTO "Clinic" ("name", "slug", "timezone", "currency", "isActive", "createdAt", "updatedAt")
SELECT
  'عيادة ' || d."fullName",
  'legacy-doctor-' || d."id",
  'Africa/Cairo',
  'EGP',
  true,
  NOW(),
  NOW()
FROM "Doctor" d
WHERE d."clinicId" IS NULL;

UPDATE "Doctor" d
SET "clinicId" = c."id"
FROM "Clinic" c
WHERE d."clinicId" IS NULL
  AND c."slug" = 'legacy-doctor-' || d."id";

UPDATE "AppointmentSlot" s
SET "clinicId" = d."clinicId"
FROM "Doctor" d
WHERE s."doctorId" = d."id"
  AND s."clinicId" IS NULL;

UPDATE "Appointment" a
SET "clinicId" = d."clinicId"
FROM "Doctor" d
WHERE a."doctorId" = d."id"
  AND a."clinicId" IS NULL;

UPDATE "MedicalRecord" r
SET "clinicId" = d."clinicId"
FROM "Doctor" d
WHERE r."doctorId" = d."id"
  AND r."clinicId" IS NULL;

UPDATE "Review" r
SET "clinicId" = d."clinicId"
FROM "Doctor" d
WHERE r."doctorId" = d."id"
  AND r."clinicId" IS NULL;

UPDATE "MedicalAttachment" a
SET "clinicId" = ap."clinicId"
FROM "Appointment" ap
WHERE a."appointmentId" = ap."id"
  AND a."clinicId" IS NULL;

UPDATE "WeeklyScheduleTemplate" t
SET "clinicId" = d."clinicId"
FROM "Doctor" d
WHERE t."doctorId" = d."id"
  AND t."clinicId" IS NULL;

UPDATE "DoctorLeave" l
SET "clinicId" = d."clinicId"
FROM "Doctor" d
WHERE l."doctorId" = d."id"
  AND l."clinicId" IS NULL;

-- Fail loudly instead of silently leaving cross-tenant rows unscoped.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Doctor" WHERE "clinicId" IS NULL)
    OR EXISTS (SELECT 1 FROM "AppointmentSlot" WHERE "clinicId" IS NULL)
    OR EXISTS (SELECT 1 FROM "Appointment" WHERE "clinicId" IS NULL)
    OR EXISTS (SELECT 1 FROM "MedicalRecord" WHERE "clinicId" IS NULL)
    OR EXISTS (SELECT 1 FROM "Review" WHERE "clinicId" IS NULL)
    OR EXISTS (SELECT 1 FROM "MedicalAttachment" WHERE "clinicId" IS NULL)
    OR EXISTS (SELECT 1 FROM "WeeklyScheduleTemplate" WHERE "clinicId" IS NULL)
    OR EXISTS (SELECT 1 FROM "DoctorLeave" WHERE "clinicId" IS NULL)
  THEN RAISE EXCEPTION 'Clinic backfill incomplete; refusing to enforce tenant constraints';
  END IF;
END $$;

ALTER TABLE "Doctor" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "AppointmentSlot" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "MedicalRecord" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Review" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "MedicalAttachment" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "WeeklyScheduleTemplate" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "DoctorLeave" ALTER COLUMN "clinicId" SET NOT NULL;
