-- CreateTable
CREATE TABLE "NewsletterPayment" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "razorpayId" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "planType" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterPayment_razorpayId_key" ON "NewsletterPayment"("razorpayId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterPayment_razorpayOrderId_key" ON "NewsletterPayment"("razorpayOrderId");

-- AddForeignKey
ALTER TABLE "NewsletterPayment" ADD CONSTRAINT "NewsletterPayment_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
