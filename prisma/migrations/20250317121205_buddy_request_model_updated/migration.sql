/*
  Warnings:

  - Changed the type of `timeSlot` on the `BuddyRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "buddyTimeSlot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- AlterTable
ALTER TABLE "BuddyRequest" DROP COLUMN "timeSlot",
ADD COLUMN     "timeSlot" "buddyTimeSlot" NOT NULL;

-- DropEnum
DROP TYPE "BuddyTimeSlot";
