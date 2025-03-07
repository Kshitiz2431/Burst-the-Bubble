-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "currentOTP" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3);
