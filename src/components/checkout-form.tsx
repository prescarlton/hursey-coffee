"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatCents } from "@/lib/format";
import { CAR_COLORS, CAR_TYPES, PARKING_SPACES } from "@/lib/cars";
import { REVTRAK_FUNDRAISER_NAME } from "@/lib/payment";
import {
  createCheckoutSession,
  type CheckoutState,
} from "@/app/actions/checkout";

const initialCheckoutState: CheckoutState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
      {message}
    </p>
  );
}

export function CheckoutForm() {
  const { items, totalCents, setQuantity, removeItem } = useCart();
  const [state, formAction, pending] = useActionState(
    createCheckoutSession,
    initialCheckoutState,
  );
  const errors = state.errors ?? {};

  const cartPayload = JSON.stringify(
    items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
        <p className="text-zinc-600 dark:text-zinc-400">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-amber-700 px-6 text-sm font-medium text-white hover:bg-amber-800"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Cart summary */}
      <section className="lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">Your order</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.menuItemId}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="min-w-0">
                <p className="whitespace-pre-line break-words font-medium">
                  {item.name}
                </p>
                <p className="text-sm text-zinc-500">
                  {formatCents(item.priceCents)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Decrease ${item.name}`}
                  onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
                  className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20"
                >
                  −
                </button>
                <span className="w-6 text-center tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${item.name}`}
                  onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
                  className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20"
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeItem(item.menuItemId)}
                  className="ml-1 text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-lg font-semibold dark:border-white/10">
          <span>Total</span>
          <span>{formatCents(totalCents)}</span>
        </div>
        <FieldError message={errors.cart} />
      </section>

      {/* Customer details + payment */}
      <section className="lg:col-span-3">
        <h2 className="mb-4 text-lg font-semibold">Your details</h2>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="cart" value={cartPayload} />

          <div>
            <label htmlFor="customerName" className="mb-1 block text-sm font-medium">
              Your name
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
            />
            <FieldError message={errors.customerName} />
          </div>

          <div>
            <label htmlFor="parkingSpace" className="mb-1 block text-sm font-medium">
              Parking space you&apos;re pulling into
            </label>
            <select
              id="parkingSpace"
              name="parkingSpace"
              required
              defaultValue=""
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
            >
              <option value="" disabled>
                Select…
              </option>
              {PARKING_SPACES.map((n) => (
                <option key={n} value={n}>
                  Space {n}
                </option>
              ))}
            </select>
            <FieldError message={errors.parkingSpace} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="carColor" className="mb-1 block text-sm font-medium">
                Car color
              </label>
              <select
                id="carColor"
                name="carColor"
                required
                defaultValue=""
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
              >
                <option value="" disabled>
                  Select…
                </option>
                {CAR_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError message={errors.carColor} />
            </div>

            <div>
              <label htmlFor="carType" className="mb-1 block text-sm font-medium">
                Car type
              </label>
              <select
                id="carType"
                name="carType"
                required
                defaultValue=""
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
              >
                <option value="" disabled>
                  Select…
                </option>
                {CAR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <FieldError message={errors.carType} />
            </div>
          </div>

          <FieldError message={errors.form} />

          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full bg-amber-700 px-6 font-medium text-white transition-colors hover:bg-amber-800 disabled:opacity-70"
          >
            {pending
              ? "Placing order…"
              : `Place order · ${formatCents(totalCents)}`}
          </button>
          <p className="text-center text-xs text-zinc-500">
            After placing your order you&apos;ll pay on RevTrak (select{" "}
            {REVTRAK_FUNDRAISER_NAME}).
          </p>
        </form>
      </section>
    </div>
  );
}
