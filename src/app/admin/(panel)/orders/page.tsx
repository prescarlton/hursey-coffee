import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getOrders } from "@/lib/orders";
import {
  formatCents,
  formatHandoff,
  formatOrderNumber,
  formatOrderTime,
} from "@/lib/format";
import { setOrderCompletedAction } from "./actions";

export const dynamic = "force-dynamic";

type OrderWithItems = Awaited<ReturnType<typeof getOrders>>[number];

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getOrders();
  const open = orders.filter((o) => !o.completedAt);
  // Most recently checked off first, so an accidental click is easy to undo.
  const completed = orders
    .filter((o) => o.completedAt)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-zinc-500">
            {open.length} open · {completed.length} completed, newest first.
          </p>
        </div>
        <Link
          href="/admin/orders/print"
          className="h-10 shrink-0 rounded-full bg-amber-700 px-5 text-sm font-medium leading-10 text-white hover:bg-amber-800"
        >
          Print list
        </Link>
      </div>

      {open.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-8 text-center text-zinc-500 dark:border-white/15">
          {completed.length === 0 ? "No orders yet." : "All caught up."}
        </p>
      ) : (
        <OrdersTable orders={open} />
      )}

      {completed.length > 0 && (
        <details className="mt-8">
          <summary className="mb-3 cursor-pointer text-sm font-medium text-zinc-500">
            Completed ({completed.length})
          </summary>
          <OrdersTable orders={completed} completed />
        </details>
      )}
    </div>
  );
}

function OrdersTable({
  orders,
  completed = false,
}: {
  orders: OrderWithItems[];
  completed?: boolean;
}) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 ${completed ? "text-zinc-500" : ""}`}
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-black/[.03] text-xs uppercase tracking-wide text-zinc-500 dark:bg-white/[.04]">
          <tr>
            <th className="px-3 py-2">
              <span className="sr-only">Status</span>
            </th>
            <th className="px-3 py-2">Order</th>
            <th className="px-3 py-2">Placed</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Space / Location</th>
            <th className="px-3 py-2">Car</th>
            <th className="px-3 py-2">Items</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {orders.map((o) => {
            const handoff = formatHandoff(o);
            return (
            <tr key={o.id}>
              <td className="px-3 py-2">
                <form action={setOrderCompletedAction}>
                  <input type="hidden" name="id" value={o.id} />
                  <input
                    type="hidden"
                    name="completed"
                    value={completed ? "0" : "1"}
                  />
                  {completed ? (
                    <button
                      type="submit"
                      className="h-8 rounded-full border border-black/15 px-3 text-xs font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                    >
                      Undo
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="h-8 rounded-full bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      ✓ Done
                    </button>
                  )}
                </form>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-medium tabular-nums">
                {formatOrderNumber(o.orderNumber)}
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                {formatOrderTime(o.createdAt)}
              </td>
              <td className="px-3 py-2">{o.customerName}</td>
              <td className="whitespace-nowrap px-3 py-2 font-medium tabular-nums">
                {handoff.isTeacher ? handoff.where : o.parkingSpace}
                {handoff.isTeacher && (
                  <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">Teacher</span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                {handoff.car}
              </td>
              <td className="whitespace-pre-line px-3 py-2">
                {o.items
                  .map((i) => `${i.quantity}× ${i.nameSnapshot}`)
                  .join(", ")}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                {formatCents(o.totalCents)}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
