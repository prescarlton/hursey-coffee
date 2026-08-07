"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ☕ Hursey Coffee
        </Link>
        <Link
          href="/checkout"
          className="relative rounded-full border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          Cart
          {itemCount > 0 ? (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-700 px-1.5 text-xs font-semibold text-white">
              {itemCount}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
