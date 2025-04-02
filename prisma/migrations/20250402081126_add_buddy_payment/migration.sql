/*
  Warnings:

  - You are about to drop the column `email` on the `BuddyPayment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[buddyRequestId]` on the table `BuddyPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BuddyPayment" DROP COLUMN "email",
ADD COLUMN     "razorpaySignature" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "BuddyPayment_buddyRequestId_key" ON "BuddyPayment"("buddyRequestId");
