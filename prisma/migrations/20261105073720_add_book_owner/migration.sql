-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Book_ownerId_idx" ON "Book"("ownerId");
