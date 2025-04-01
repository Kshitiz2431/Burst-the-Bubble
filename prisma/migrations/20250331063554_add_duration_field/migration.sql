-- AlterTable
ALTER TABLE "BuddyRequest" ADD COLUMN "duration" TEXT;
UPDATE "BuddyRequest" SET "duration" = '30' WHERE "duration" IS NULL;
ALTER TABLE "BuddyRequest" ALTER COLUMN "duration" SET NOT NULL;
