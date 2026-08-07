import Link from "next/link";
import { getMenuItems } from "@/lib/menu";
import { MenuItemCard } from "@/components/menu-item-card";

// Render on each request so back-office menu/price edits appear immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await getMenuItems();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Order Coffee</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Every cup supports our school fundraiser. Add drinks to your cart, then
          check out — we&apos;ll bring your order right to your car at pickup.
        </p>
      </section>

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
            />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Link
          href="/checkout"
          className="inline-flex h-11 items-center rounded-full bg-amber-700 px-6 text-sm font-medium text-white hover:bg-amber-800"
        >
          Go to checkout →
        </Link>
      </div>
    </div>
  );
}
