-- Add a short, human-readable order number to Order.
-- The sequence starts at 1001 so numbers read like real pickup tickets
-- (e.g. #1042) and are distinct from the long Stripe session id.
-- Existing rows are backfilled from the same sequence.

ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;

CREATE SEQUENCE "Order_orderNumber_seq" START WITH 1001 OWNED BY "Order"."orderNumber";

UPDATE "Order"
SET "orderNumber" = nextval('"Order_orderNumber_seq"')
WHERE "orderNumber" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET DEFAULT nextval('"Order_orderNumber_seq"');

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
