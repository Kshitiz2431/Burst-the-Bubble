/*
  Warnings:

  - The values [VIDEO] on the enum `BuddyMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BuddyMode_new" AS ENUM ('CHAT', 'CALL');
ALTER TABLE "BuddyRequest" ALTER COLUMN "mode" TYPE "BuddyMode_new" USING ("mode"::text::"BuddyMode_new");
ALTER TYPE "BuddyMode" RENAME TO "BuddyMode_old";
ALTER TYPE "BuddyMode_new" RENAME TO "BuddyMode";
DROP TYPE "BuddyMode_old";
COMMIT;
