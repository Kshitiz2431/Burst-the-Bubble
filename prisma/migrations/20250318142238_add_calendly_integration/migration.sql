/*
  Warnings:

  - Changed the type of `timeSlot` on the `BuddyRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BuddyRequest" ADD COLUMN     "calendlyEventId" TEXT,
ADD COLUMN     "calendlyEventUri" TEXT;

-- Add a temporary column for string-based timeSlot
ALTER TABLE "BuddyRequest" 
ADD COLUMN "temp_timeSlot" TEXT;

-- Copy data from enum to string
UPDATE "BuddyRequest" 
SET "temp_timeSlot" = "timeSlot"::TEXT;

-- Drop the old enum column
ALTER TABLE "BuddyRequest" 
DROP COLUMN "timeSlot";

-- Rename the temp column to the original name
ALTER TABLE "BuddyRequest" 
RENAME COLUMN "temp_timeSlot" TO "timeSlot";

-- Make timeSlot NOT NULL
ALTER TABLE "BuddyRequest" 
ALTER COLUMN "timeSlot" SET NOT NULL;

-- Drop the enum type
DROP TYPE "buddyTimeSlot";
