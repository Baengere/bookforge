-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "authorEarnings" DECIMAL(10,2),
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "commissionRate" INTEGER,
ADD COLUMN     "netAmount" DECIMAL(10,2),
ADD COLUMN     "platformCommission" DECIMAL(10,2),
ADD COLUMN     "processingFee" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Purchase_authorId_idx" ON "Purchase"("authorId");
