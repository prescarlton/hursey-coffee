-- Ordering is always open now: drop the Friday batch, pickup time slot, and
-- school fields, and record which parking space (1–8) the customer pulls into.
-- The temporary default only backfills existing rows, then is dropped so the
-- column matches the schema (NOT NULL, no @default).
ALTER TABLE "Order" DROP COLUMN "kidName";
ALTER TABLE "Order" DROP COLUMN "teacherName";
ALTER TABLE "Order" DROP COLUMN "pickupTime";
ALTER TABLE "Order" DROP COLUMN "serviceDate";
ALTER TABLE "Order" ADD COLUMN "parkingSpace" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Order" ALTER COLUMN "parkingSpace" DROP DEFAULT;
