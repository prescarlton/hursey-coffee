-- The Friday (YYYY-MM-DD) each order is for, so the admin can scope the batch.
-- Backfill the one existing dev order with a temporary default, then drop it so
-- the column matches the schema (NOT NULL, no @default).
ALTER TABLE "Order" ADD COLUMN "serviceDate" TEXT NOT NULL DEFAULT '2026-08-07';
ALTER TABLE "Order" ALTER COLUMN "serviceDate" DROP DEFAULT;
