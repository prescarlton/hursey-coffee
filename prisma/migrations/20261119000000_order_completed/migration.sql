-- Admins check orders off once handed off; null means the order is still open.
ALTER TABLE "Order" ADD COLUMN "completedAt" TIMESTAMP(3);
