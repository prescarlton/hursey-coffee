import Link from "next/link";
import { ClearCart } from "@/components/clear-cart";
import { getOrderByStripeSession, markOrderPaid } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";
import { formatCents, formatOrderNumber } from "@/lib/format";
import { formatPickupTime } from "@/lib/pickup";

// The order + Stripe status can change (webhook), so always render fresh.
export const dynamic = "force-dynamic";

function NotFound({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="text-5xl">🤔</div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        We couldn&apos;t find that order
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">{message}</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-amber-700 px-6 text-sm font-medium text-white hover:bg-amber-800"
      >
        Back to menu
      </Link>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

export default async function OrderSuccessPage(
  props: PageProps<"/order/success">,
) {
  const raw = (await props.searchParams).session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;

  if (!sessionId) {
    return (
      <NotFound message="This confirmation link is missing its order reference." />
    );
  }

  // Defensively confirm payment straight from Stripe so the receipt is reliable
  // even if the webhook hasn't fired yet (or isn't running in dev). markOrderPaid
  // is idempotent, so this is safe alongside the webhook. If Stripe is
  // unreachable, fall back to whatever status the DB already has.
  let paidViaStripe = false;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      paidViaStripe = true;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;
      await markOrderPaid(sessionId, paymentIntentId);
    }
  } catch {
    // Ignore — we'll display the order using its current DB status.
  }

  const order = await getOrderByStripeSession(sessionId);
  if (!order) {
    return (
      <NotFound message="We couldn't match this payment to an order yet. If you were charged, please contact us with your receipt." />
    );
  }

  const isPaid = order.status === "PAID" || paidViaStripe;

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <ClearCart />

      <div className="text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Order confirmed
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Thanks, {order.customerName.split(" ")[0]}! We&apos;ll bring your order
          to your car at pickup.
        </p>
      </div>

      {/* Prominent pickup number — the thing to reference at the car line. */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Your pickup number
        </p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums text-amber-800 dark:text-amber-300">
          {formatOrderNumber(order.orderNumber)}
        </p>
        <p className="mt-2 text-sm text-amber-700/80 dark:text-amber-400/80">
          Show this number at the car line — screenshot it so it&apos;s handy.
        </p>
      </div>

      {/* Payment status */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <span className="text-sm text-zinc-500">Payment</span>
        {isPaid ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-500/15 dark:text-green-400">
            ● Paid — {formatCents(order.totalCents)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            ● Processing…
          </span>
        )}
      </div>

      {/* Pickup details */}
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Pickup details
        </h2>
        <dl className="grid grid-cols-2 gap-4">
          <DetailRow
            label="Pickup time"
            value={formatPickupTime(order.pickupTime)}
          />
          <DetailRow label="Name" value={order.customerName} />
          <DetailRow
            label="Vehicle"
            value={`${order.carColor} ${order.carType}`}
          />
          <DetailRow label="Child" value={order.kidName} />
          <DetailRow label="Teacher" value={order.teacherName} />
        </dl>
      </div>

      {/* Itemized order */}
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Your order
        </h2>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span>
                <span className="font-medium tabular-nums">
                  {item.quantity}×
                </span>{" "}
                {item.nameSnapshot}
              </span>
              <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                {formatCents(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3 font-semibold dark:border-white/10">
          <span>Total</span>
          <span className="tabular-nums">{formatCents(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-amber-700 px-6 text-sm font-medium text-white hover:bg-amber-800"
        >
          Back to menu
        </Link>
      </div>
    </div>
  );
}
