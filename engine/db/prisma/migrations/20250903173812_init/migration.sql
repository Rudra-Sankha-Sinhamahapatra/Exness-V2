-- CreateTable
CREATE TABLE "public"."Snapshot" (
    "id" TEXT NOT NULL,
    "offsetId" INTEGER NOT NULL,
    "openOrders" JSONB NOT NULL,
    "closedOrders" JSONB NOT NULL,
    "balances" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);
