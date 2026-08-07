import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getPaidOrders } from "@/lib/orders";
import { formatCents, formatOrderNumber } from "@/lib/format";
import { formatPickupTime } from "@/lib/pickup";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getPaidOrders();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-zinc-500">
            {orders.length} paid {orders.length === 1 ? "order" : "orders"},
            sorted by pickup time.
          </p>
        </div>
        <Link
          href="/admin/orders/print"
          className="h-10 shrink-0 rounded-full bg-amber-700 px-5 text-sm font-medium leading-10 text-white hover:bg-amber-800"
        >
          Print list
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-8 text-center text-zinc-500 dark:border-white/15">
          No paid orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.03] text-xs uppercase tracking-wide text-zinc-500 dark:bg-white/[.04]">
              <tr>
                <th className="px-3 py-2">Pickup</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Car</th>
                <th className="px-3 py-2">Child</th>
                <th className="px-3 py-2">Teacher</th>
                <th className="px-3 py-2">Items</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium">
                    {formatPickupTime(o.pickupTime)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {formatOrderNumber(o.orderNumber)}
                  </td>
                  <td className="px-3 py-2">{o.customerName}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {o.carColor} {o.carType}
                  </td>
                  <td className="px-3 py-2">{o.kidName}</td>
                  <td className="px-3 py-2">{o.teacherName}</td>
                  <td className="px-3 py-2">
                    {o.items
                      .map((i) => `${i.quantity}× ${i.nameSnapshot}`)
                      .join(", ")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                    {formatCents(o.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
