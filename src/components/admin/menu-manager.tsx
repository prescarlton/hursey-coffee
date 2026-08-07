"use client";

import { useState } from "react";
import { formatCents } from "@/lib/format";
import {
  createMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
} from "@/app/admin/(panel)/menu/actions";

type Item = { id: string; name: string; priceCents: number };

const fieldClass =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base dark:border-white/20 dark:bg-zinc-900";
const primaryBtn =
  "rounded-full bg-amber-700 px-5 py-3 text-base font-semibold text-white hover:bg-amber-800";
const quietBtn =
  "rounded-full border border-black/15 px-5 py-3 text-base font-medium hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]";

/** A single dollars price field with a leading $ sign. */
function PriceField({ defaultValue }: { defaultValue?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-zinc-400">
        $
      </span>
      <input
        name="price"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        required
        defaultValue={defaultValue}
        placeholder="0.00"
        className={`${fieldClass} pl-8`}
      />
    </div>
  );
}

function MenuRow({ item }: { item: Item }) {
  const [mode, setMode] = useState<"view" | "edit" | "confirmDelete">("view");
  const priceDollars = (item.priceCents / 100).toFixed(2);

  if (mode === "edit") {
    return (
      <li className="py-3">
        <form
          action={async (formData) => {
            await updateMenuItemAction(formData);
            setMode("view");
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="id" value={item.id} />
          <input
            name="name"
            defaultValue={item.name}
            required
            aria-label="Drink name"
            className={`${fieldClass} sm:flex-1`}
          />
          <div className="sm:w-32">
            <PriceField defaultValue={priceDollars} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className={primaryBtn}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className={quietBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  if (mode === "confirmDelete") {
    return (
      <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg">
          Delete <span className="font-semibold">{item.name}</span>?
        </span>
        <div className="flex gap-2">
          <form action={deleteMenuItemAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="rounded-full bg-red-600 px-5 py-3 text-base font-semibold text-white hover:bg-red-700"
            >
              Yes, delete
            </button>
          </form>
          <button
            type="button"
            onClick={() => setMode("view")}
            className={quietBtn}
          >
            Keep it
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 py-4">
      <span className="flex-1 text-lg font-medium">☕ {item.name}</span>
      <span className="text-lg font-semibold tabular-nums text-amber-700 dark:text-amber-500">
        {formatCents(item.priceCents)}
      </span>
      <button
        type="button"
        onClick={() => setMode("edit")}
        className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => setMode("confirmDelete")}
        aria-label={`Delete ${item.name}`}
        className="rounded-full px-3 py-2 text-lg hover:bg-black/[.04] dark:hover:bg-white/[.06]"
      >
        🗑
      </button>
    </li>
  );
}

export function MenuManager({ items }: { items: Item[] }) {
  return (
    <div className="space-y-8">
      {/* Add a drink */}
      <section className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold">Add a drink</h2>
        <form
          action={createMenuItemAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input
            name="name"
            required
            aria-label="Drink name"
            placeholder="Drink name"
            className={`${fieldClass} sm:flex-1`}
          />
          <div className="sm:w-32">
            <PriceField />
          </div>
          <button type="submit" className={`${primaryBtn} whitespace-nowrap`}>
            ＋ Add drink
          </button>
        </form>
      </section>

      {/* Drink list */}
      <section>
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-zinc-500 dark:border-white/15">
            No drinks yet. Add your first one above!
          </p>
        ) : (
          <ul className="divide-y divide-black/5 rounded-2xl border border-black/10 bg-white px-5 dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900">
            {items.map((item) => (
              <MenuRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
