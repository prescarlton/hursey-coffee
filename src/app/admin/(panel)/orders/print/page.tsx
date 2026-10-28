import { requireAdmin } from "@/lib/admin-auth";
import { getOrders } from "@/lib/orders";
import {
  formatCents,
  formatHandoff,
  formatOrderNumber,
  formatOrderTime,
} from "@/lib/format";
import { PrintButton } from "@/components/admin/print-button";

export const dynamic = "force-dynamic";

export default async function PrintOrdersPage() {
  await requireAdmin();
  const orders = await getOrders();

  const printedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-zinc-500">
          {orders.length} {orders.length === 1 ? "order" : "orders"}, newest
          first.
        </p>
        <PrintButton />
      </div>

      <div className="mb-4">
        <h1 className="text-xl font-bold">Bulldog Brews — orders</h1>
        <p className="text-sm text-zinc-500 print:text-black">
          {orders.length} orders · printed {printedAt}
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-zinc-500">No orders to print.</p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-1 pr-3">Order</th>
              <th className="py-1 pr-3">Placed</th>
              <th className="py-1 pr-3">Name</th>
              <th className="py-1 pr-3">Space / Location</th>
              <th className="py-1 pr-3">Car</th>
              <th className="py-1 pr-3">Items</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const handoff = formatHandoff(o);
              return (
              <tr
                key={o.id}
                className="border-b border-black/30 print:border-black/40"
              >
                <td className="whitespace-nowrap py-1.5 pr-3 font-semibold tabular-nums">
                  {formatOrderNumber(o.orderNumber)}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-3">
                  {formatOrderTime(o.createdAt)}
                </td>
                <td className="py-1.5 pr-3">{o.customerName}</td>
                <td className="whitespace-nowrap py-1.5 pr-3 font-semibold tabular-nums">
                  {handoff.isTeacher ? handoff.where : o.parkingSpace}
                  {handoff.isTeacher && (
                    <span className="ml-1 text-[10px] font-semibold uppercase">Teacher</span>
                  )}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-3">
                  {handoff.car}
                </td>
                <td className="whitespace-pre-line py-1.5 pr-3">
                  {o.items
                    .map((i) => `${i.quantity}× ${i.nameSnapshot}`)
                    .join(", ")}
                </td>
                <td className="whitespace-nowrap py-1.5 text-right tabular-nums">
                  {formatCents(o.totalCents)}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
