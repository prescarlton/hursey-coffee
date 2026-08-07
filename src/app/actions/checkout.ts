"use server";

import { redirect } from "next/navigation";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { getMenuItemsByIds } from "@/lib/menu";
import { createPendingOrder, attachStripeSession } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";
import { getOrderingStatus } from "@/lib/ordering-window";

export type CheckoutState = {
  errors?: Record<string, string>;
};

export async function createCheckoutSession(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  // Authoritative gate: reject orders while ordering is closed for the week.
  const status = getOrderingStatus();
  if (!status.open) {
    return {
      errors: {
        form: `Ordering is closed for this week. It reopens ${status.reopensLabel}.`,
      },
    };
  }

  // The cart travels in a hidden JSON field; customer details are normal inputs.
  let cartRaw: unknown = [];
  try {
    cartRaw = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { errors: { cart: "Your cart could not be read. Please try again." } };
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    carColor: formData.get("carColor"),
    carType: formData.get("carType"),
    kidName: formData.get("kidName"),
    teacherName: formData.get("teacherName"),
    pickupTime: formData.get("pickupTime"),
    cart: cartRaw,
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const {
    customerName,
    carColor,
    carType,
    kidName,
    teacherName,
    pickupTime,
    cart,
  } = parsed.data;

  // Re-derive authoritative prices from the DB — never trust client-side prices.
  const dbItems = await getMenuItemsByIds(cart.map((c) => c.menuItemId));
  const byId = new Map(dbItems.map((i) => [i.id, i]));

  const lineItems = cart.flatMap((c) => {
    const item = byId.get(c.menuItemId);
    if (!item) return [];
    return [{ item, quantity: c.quantity }];
  });

  if (lineItems.length === 0) {
    return { errors: { cart: "None of your items are available anymore." } };
  }

  const totalCents = lineItems.reduce(
    (sum, li) => sum + li.item.priceCents * li.quantity,
    0,
  );

  // Persist a PENDING order with price/name snapshots before sending to Stripe.
  const order = await createPendingOrder({
    customerName,
    carColor,
    carType,
    kidName,
    teacherName,
    pickupTime,
    serviceDate: status.serviceDate,
    totalCents,
    items: lineItems.map((li) => ({
      menuItemId: li.item.id,
      nameSnapshot: li.item.name,
      unitPriceCents: li.item.priceCents,
      quantity: li.quantity,
    })),
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  let session: Awaited<
    ReturnType<ReturnType<typeof getStripe>["checkout"]["sessions"]["create"]>
  >;
  try {
    session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((li) => ({
        quantity: li.quantity,
        price_data: {
          currency: "usd",
          unit_amount: li.item.priceCents,
          product_data: { name: li.item.name },
        },
      })),
      metadata: { orderId: order.id },
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order/cancelled`,
    });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return {
      errors: {
        form: "We couldn't start payment. Please try again in a moment.",
      },
    };
  }

  if (!session.url) {
    return { errors: { form: "Could not start checkout. Please try again." } };
  }

  await attachStripeSession(order.id, session.id);

  // Sends the parent to Stripe's hosted payment page (throws NEXT_REDIRECT).
  redirect(session.url);
}
