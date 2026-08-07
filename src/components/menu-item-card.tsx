"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatCents } from "@/lib/format";

export type MenuItemCardProps = {
  id: string;
  name: string;
  priceCents: number;
};

export function MenuItemCard({ id, name, priceCents }: MenuItemCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ menuItemId: id, name, priceCents });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {name}
          </h3>
          <span className="shrink-0 font-semibold text-amber-700 dark:text-amber-500">
            {formatCents(priceCents)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 h-10 rounded-full bg-amber-700 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:opacity-70"
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
