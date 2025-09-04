/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `ExistingTrade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `ExistingTrade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ExistingTrade" ADD COLUMN     "orderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ExistingTrade_orderId_key" ON "public"."ExistingTrade"("orderId");

-- CreateIndex
CREATE INDEX "ExistingTrade_userId_createdAt_idx" ON "public"."ExistingTrade"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExistingTrade_assetId_createdAt_idx" ON "public"."ExistingTrade"("assetId", "createdAt");
