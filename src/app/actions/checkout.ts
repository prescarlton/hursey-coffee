"use server";

import { redirect } from "next/navigation";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { getMenuItemsByIds } from "@/lib/menu";
import { createOrder } from "@/lib/orders";
import { getOrderingStatus } from "@/lib/ordering-window";

export type CheckoutState = {
  errors?: Record<string, string>;
};

export async function createCheckoutSession(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  // Authoritative gate: reject orders outside the ordering window.
  const status = getOrderingStatus();
  if (!status.open) {
    return {
      errors: { form: `Ordering is closed. It opens ${status.opensLabel}.` },
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
    parkingSpace: formData.get("parkingSpace"),
    carColor: formData.get("carColor"),
    carType: formData.get("carType"),
    cart: cartRaw,
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { customerName, parkingSpace, carColor, carType, cart } = parsed.data;

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

  // Persist the order with price/name snapshots; payment happens on RevTrak.
  const order = await createOrder({
    customerName,
    carColor,
    carType,
    parkingSpace,
    totalCents,
    items: lineItems.map((li) => ({
      menuItemId: li.item.id,
      nameSnapshot: li.item.name,
      unitPriceCents: li.item.priceCents,
      quantity: li.quantity,
    })),
  });

  // Show the confirmation page with RevTrak payment instructions.
  redirect(`/order/${order.id}`);
}
