-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "planEnd" TIMESTAMP(3),
ADD COLUMN     "planStart" TIMESTAMP(3),
ADD COLUMN     "planType" TEXT;
