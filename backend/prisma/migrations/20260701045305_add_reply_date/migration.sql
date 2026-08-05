/*
  Warnings:

  - You are about to drop the column `doctorRepliedAt` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "doctorRepliedAt",
ADD COLUMN     "repliedAt" TIMESTAMP(3);
