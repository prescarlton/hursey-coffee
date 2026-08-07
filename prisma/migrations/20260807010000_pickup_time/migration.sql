-- Add the parent's chosen Friday pickup time to Order.
-- Stored as a canonical 24h "HH:mm" string (e.g. "07:05").
-- Backfill the existing row with a temporary default, then drop the default
-- so the column matches the schema (NOT NULL, no @default).

ALTER TABLE "Order" ADD COLUMN "pickupTime" TEXT NOT NULL DEFAULT '07:00';
ALTER TABLE "Order" ALTER COLUMN "pickupTime" DROP DEFAULT;
