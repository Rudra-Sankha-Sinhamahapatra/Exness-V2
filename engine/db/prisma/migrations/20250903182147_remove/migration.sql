/*
  Warnings:

  - You are about to drop the column `offsetId` on the `Snapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Snapshot" DROP COLUMN "offsetId";
