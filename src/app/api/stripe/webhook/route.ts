import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";

// Stripe webhook receiver. Runs on the Node.js runtime (route handler default),
// which Stripe's signature verification requires. The raw request body is read
// with request.text() — no bodyParser config is needed in the App Router.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return new Response("Missing Stripe signature or webhook secret", {
      status: 400,
    });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;
    // Idempotent: only flips PENDING orders to PAID, so redelivery is safe.
    await markOrderPaid(session.id, paymentIntentId);
  }

  return new Response("ok", { status: 200 });
}
