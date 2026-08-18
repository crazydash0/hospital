ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");

CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK');
CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PHONE');
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_BOOKED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_REMINDER', 'PASSWORD_RESET');
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'IN_APP');

CREATE TABLE "AuthIdentity" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "provider" "AuthProvider" NOT NULL,
  "providerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AuthIdentity_provider_providerId_key" ON "AuthIdentity"("provider", "providerId");
CREATE UNIQUE INDEX "AuthIdentity_userId_provider_key" ON "AuthIdentity"("userId", "provider");
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "VerificationCode" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER,
  "target" TEXT NOT NULL,
  "type" "VerificationType" NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VerificationCode_target_type_expiresAt_idx" ON "VerificationCode"("target", "type", "expiresAt");
CREATE INDEX "VerificationCode_userId_type_idx" ON "VerificationCode"("userId", "type");
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "OAuthState" (
  "id" SERIAL NOT NULL,
  "state" TEXT NOT NULL,
  "provider" "AuthProvider" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OAuthState_state_key" ON "OAuthState"("state");
CREATE INDEX "OAuthState_expiresAt_idx" ON "OAuthState"("expiresAt");

CREATE TABLE "Notification" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "type" "NotificationType" NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "appointmentId" INTEGER,
  "sentAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_appointmentId_type_channel_idx" ON "Notification"("appointmentId", "type", "channel");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NotificationPreference" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "email" BOOLEAN NOT NULL DEFAULT true,
  "sms" BOOLEAN NOT NULL DEFAULT true,
  "inApp" BOOLEAN NOT NULL DEFAULT true,
  "reminders" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AppointmentReminder" (
  "id" SERIAL NOT NULL,
  "appointmentId" INTEGER NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "AppointmentReminder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AppointmentReminder_appointmentId_key" ON "AppointmentReminder"("appointmentId");
CREATE INDEX "AppointmentReminder_scheduledFor_processedAt_idx" ON "AppointmentReminder"("scheduledFor", "processedAt");
ALTER TABLE "AppointmentReminder" ADD CONSTRAINT "AppointmentReminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "NotificationPreference" ("userId")
SELECT "id" FROM "User" u WHERE NOT EXISTS (SELECT 1 FROM "NotificationPreference" p WHERE p."userId" = u."id");

UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "email" IS NOT NULL AND "emailVerifiedAt" IS NULL;
