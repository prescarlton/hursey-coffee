import Link from "next/link";

export default function OrderCancelledPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="text-5xl">☕</div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Payment cancelled
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        No worries — your cart is still saved. You can review it and try again
        whenever you&apos;re ready.
      </p>
      <Link
        href="/checkout"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-amber-700 px-6 text-sm font-medium text-white hover:bg-amber-800"
      >
        Return to checkout
      </Link>
    </div>
  );
}
