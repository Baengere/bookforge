/*
  Warnings:

  - A unique constraint covering the columns `[accessTokenHash]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "accessTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "accessTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_accessTokenHash_key" ON "Purchase"("accessTokenHash");
