import "server-only";
import Stripe from "stripe";

// Lazily construct the Stripe client so a missing key surfaces a clear error at
// request time (when checkout actually runs) rather than crashing module load
// during build. apiVersion is omitted to use the SDK's pinned default.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to your .env file.");
  }
  client = new Stripe(key);
  return client;
}
