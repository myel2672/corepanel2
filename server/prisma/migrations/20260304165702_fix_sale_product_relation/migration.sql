-- AlterTable
ALTER TABLE "StockLog" ADD COLUMN     "businessId" TEXT;

-- AddForeignKey
ALTER TABLE "StockLog" ADD CONSTRAINT "StockLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
