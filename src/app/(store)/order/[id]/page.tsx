import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCart } from "@/components/clear-cart";
import { getOrderById } from "@/lib/orders";
import { formatCents, formatOrderNumber } from "@/lib/format";
import { REVTRAK_FUNDRAISER_NAME, REVTRAK_URL } from "@/lib/payment";

export const dynamic = "force-dynamic";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

// Keyed by the order's cuid (not the sequential order number) so parents can't
// guess their way to other people's orders.
export default async function OrderPage(props: PageProps<"/order/[id]">) {
  const { id } = await props.params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <ClearCart />

      <div className="text-center">
        <div className="text-5xl">☕</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Order placed</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Thanks, {order.customerName.split(" ")[0]}! We&apos;ll bring your order
          out to space {order.parkingSpace}.
        </p>
      </div>

      {/* Payment happens on RevTrak — the one thing left for the parent to do. */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Finish by paying on RevTrak
        </p>
        <p className="mt-2 text-amber-900 dark:text-amber-200">
          Your order will be confirmed once you pay. On RevTrak, select{" "}
          <span className="font-semibold">{REVTRAK_FUNDRAISER_NAME}</span> and
          pay <span className="font-semibold">{formatCents(order.totalCents)}</span>.
        </p>
        <a
          href={REVTRAK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex h-12 items-center rounded-full bg-amber-700 px-8 font-medium text-white hover:bg-amber-800"
        >
          Pay on RevTrak →
        </a>
      </div>

      {/* Prominent order number — the thing to reference at handoff. */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <span className="text-sm text-zinc-500">Your order number</span>
        <span className="text-2xl font-extrabold tabular-nums">
          {formatOrderNumber(order.orderNumber)}
        </span>
      </div>

      {/* Handoff details */}
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Your details
        </h2>
        <dl className="grid grid-cols-2 gap-4">
          <DetailRow label="Name" value={order.customerName} />
          <DetailRow
            label="Parking space"
            value={`Space ${order.parkingSpace}`}
          />
          <DetailRow
            label="Vehicle"
            value={`${order.carColor} ${order.carType}`}
          />
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
          className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-500"
        >
          Back to menu
        </Link>
      </div>
    </div>
  );
}
