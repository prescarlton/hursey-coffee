import Link from "next/link";
import { getMenuItems } from "@/lib/menu";
import { getOrderingStatus } from "@/lib/ordering-window";
import { MenuItemCard } from "@/components/menu-item-card";
import { OrderingStatusBanner } from "@/components/ordering-status-banner";

// Render on each request so menu/price edits and the ordering window are live.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [items, status] = [await getMenuItems(), getOrderingStatus()];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Order Coffee</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Every cup supports our school fundraiser. Add drinks to your cart, then
          check out — we&apos;ll bring your order right to your car at pickup.
        </p>
      </section>

      <div className="mb-8">
        <OrderingStatusBanner status={status} />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-8 text-center text-zinc-500 dark:border-white/15">
          The menu isn&apos;t available right now. Please check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              priceCents={item.priceCents}
              orderingOpen={status.open}
            />
          ))}
        </div>
      )}

      {status.open ? (
        <div className="mt-10">
          <Link
            href="/checkout"
            className="inline-flex h-11 items-center rounded-full bg-amber-700 px-6 text-sm font-medium text-white hover:bg-amber-800"
          >
            Go to checkout →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
