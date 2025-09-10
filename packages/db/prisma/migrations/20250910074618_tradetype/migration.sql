/*
  Warnings:

  - Added the required column `tradeType` to the `ExistingTrade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TradeType" AS ENUM ('SHORT', 'LONG');

-- AlterTable
ALTER TABLE "public"."ExistingTrade" ADD COLUMN     "tradeType" "public"."TradeType" NOT NULL;
