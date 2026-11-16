-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('MPESA', 'BANK');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- DropIndex
DROP INDEX "Purchase_authorId_idx";

-- CreateTable
CREATE TABLE "AuthorPayoutProfile" (
    "id" SERIAL NOT NULL,
    "authorId" TEXT NOT NULL,
    "payoutMethod" "PayoutMethod" NOT NULL,
    "destinationEncrypted" TEXT NOT NULL,
    "destinationLastFour" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorPayoutProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorPayout" (
    "id" SERIAL NOT NULL,
    "authorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payoutMethod" "PayoutMethod" NOT NULL,
    "destinationEncrypted" TEXT NOT NULL,
    "destinationLastFour" TEXT,
    "transferReference" TEXT,
    "failureReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutItem" (
    "id" SERIAL NOT NULL,
    "payoutId" INTEGER NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthorPayoutProfile_authorId_key" ON "AuthorPayoutProfile"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorPayout_transferReference_key" ON "AuthorPayout"("transferReference");

-- CreateIndex
CREATE INDEX "AuthorPayout_authorId_status_idx" ON "AuthorPayout"("authorId", "status");

-- CreateIndex
CREATE INDEX "AuthorPayout_createdAt_idx" ON "AuthorPayout"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutItem_purchaseId_key" ON "PayoutItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PayoutItem_payoutId_idx" ON "PayoutItem"("payoutId");

-- CreateIndex
CREATE INDEX "Purchase_authorId_status_idx" ON "Purchase"("authorId", "status");

-- AddForeignKey
ALTER TABLE "PayoutItem" ADD CONSTRAINT "PayoutItem_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "AuthorPayout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutItem" ADD CONSTRAINT "PayoutItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
