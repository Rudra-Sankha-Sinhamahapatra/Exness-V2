-- AlterTable
ALTER TABLE "public"."ExistingTrade" ALTER COLUMN "closePrice" DROP NOT NULL,
ALTER COLUMN "pnl" DROP NOT NULL;
