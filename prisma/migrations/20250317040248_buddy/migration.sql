-- CreateEnum
CREATE TYPE "BuddyRequestType" AS ENUM ('FRIENDLY', 'DETAILED');

-- CreateEnum
CREATE TYPE "BuddyRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BuddyTimeSlot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateEnum
CREATE TYPE "BuddyMode" AS ENUM ('CHAT', 'CALL', 'VIDEO');

-- CreateTable
CREATE TABLE "BuddyRequest" (
    "id" TEXT NOT NULL,
    "type" "BuddyRequestType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" "BuddyTimeSlot" NOT NULL,
    "mode" "BuddyMode" NOT NULL,
    "message" TEXT NOT NULL,
    "extraInfo" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT true,
    "status" "BuddyRequestStatus" NOT NULL DEFAULT 'PENDING',
    "assignedBuddyId" TEXT,
    "calendlyLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuddyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buddy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "calendlyLink" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buddy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Buddy_email_key" ON "Buddy"("email");

-- AddForeignKey
ALTER TABLE "BuddyRequest" ADD CONSTRAINT "BuddyRequest_assignedBuddyId_fkey" FOREIGN KEY ("assignedBuddyId") REFERENCES "Buddy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
