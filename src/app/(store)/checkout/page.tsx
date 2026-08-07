import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { getOrderingStatus } from "@/lib/ordering-window";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const status = getOrderingStatus();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      {status.open ? (
        <CheckoutForm />
      ) : (
        <div className="rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
          <p className="text-lg font-semibold">Ordering is closed right now.</p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Orders for {status.serviceDateLabel} open {status.reopensLabel}.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-amber-700 px-6 text-sm font-medium text-white hover:bg-amber-800"
          >
            Back to menu
          </Link>
        </div>
      )}
    </div>
  );
}
