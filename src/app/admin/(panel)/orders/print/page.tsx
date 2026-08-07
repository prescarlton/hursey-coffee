import { requireAdmin } from "@/lib/admin-auth";
import { getPaidOrders } from "@/lib/orders";
import { getOrderingStatus } from "@/lib/ordering-window";
import { formatCents, formatOrderNumber } from "@/lib/format";
import { formatPickupTime } from "@/lib/pickup";
import { PrintButton } from "@/components/admin/print-button";

export const dynamic = "force-dynamic";

export default async function PrintOrdersPage() {
  await requireAdmin();
  const { serviceDate, serviceDateLabel } = getOrderingStatus();
  const orders = await getPaidOrders(serviceDate);

  const printedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-zinc-500">
          {orders.length} paid {orders.length === 1 ? "order" : "orders"} — use
          Print, then hand out at the car line.
        </p>
        <PrintButton />
      </div>

      <div className="mb-4">
        <h1 className="text-xl font-bold">
          Hursey Coffee — {serviceDateLabel}
        </h1>
        <p className="text-sm text-zinc-500 print:text-black">
          {orders.length} orders · printed {printedAt}
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-zinc-500">No paid orders to print.</p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-1 pr-3">Pickup</th>
              <th className="py-1 pr-3">Order</th>
              <th className="py-1 pr-3">Name</th>
              <th className="py-1 pr-3">Car</th>
              <th className="py-1 pr-3">Child</th>
              <th className="py-1 pr-3">Teacher</th>
              <th className="py-1 pr-3">Items</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-black/30 print:border-black/40"
              >
                <td className="whitespace-nowrap py-1.5 pr-3 font-semibold">
                  {formatPickupTime(o.pickupTime)}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-3 tabular-nums">
                  {formatOrderNumber(o.orderNumber)}
                </td>
                <td className="py-1.5 pr-3">{o.customerName}</td>
                <td className="whitespace-nowrap py-1.5 pr-3">
                  {o.carColor} {o.carType}
                </td>
                <td className="py-1.5 pr-3">{o.kidName}</td>
                <td className="py-1.5 pr-3">{o.teacherName}</td>
                <td className="py-1.5 pr-3">
                  {o.items
                    .map((i) => `${i.quantity}× ${i.nameSnapshot}`)
                    .join(", ")}
                </td>
                <td className="whitespace-nowrap py-1.5 text-right tabular-nums">
                  {formatCents(o.totalCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
