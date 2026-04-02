-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "planName" TEXT NOT NULL DEFAULT 'Starter',
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "note" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
