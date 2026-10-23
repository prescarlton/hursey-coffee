-- Payment moved off-site to RevTrak (no API/webhooks), so drop the Stripe
-- references and the payment status the app can no longer track.
DROP INDEX "Order_stripeSessionId_key";
ALTER TABLE "Order" DROP COLUMN "stripeSessionId";
ALTER TABLE "Order" DROP COLUMN "stripePaymentIntentId";
ALTER TABLE "Order" DROP COLUMN "status";
DROP TYPE "OrderStatus";
