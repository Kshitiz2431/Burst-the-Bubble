-- CreateTable
CREATE TABLE "BuddyPayment" (
    "id" TEXT NOT NULL,
    "buddyRequestId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "status" "PurchaseStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuddyPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuddyPayment_razorpayOrderId_key" ON "BuddyPayment"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyPayment_razorpayPaymentId_key" ON "BuddyPayment"("razorpayPaymentId");

-- AddForeignKey
ALTER TABLE "BuddyPayment" ADD CONSTRAINT "BuddyPayment_buddyRequestId_fkey" FOREIGN KEY ("buddyRequestId") REFERENCES "BuddyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
