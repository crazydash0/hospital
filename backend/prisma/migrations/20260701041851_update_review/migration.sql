-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "doctorRepliedAt" TIMESTAMP(3),
ADD COLUMN     "doctorReply" TEXT,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;
