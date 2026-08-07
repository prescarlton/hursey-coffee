import type { OrderingStatus } from "@/lib/ordering-window";

export function OrderingStatusBanner({ status }: { status: OrderingStatus }) {
  if (status.open) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        Ordering for <span className="font-semibold">{status.serviceDateLabel}</span>{" "}
        pickup · closes {status.closesLabel}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-4 text-zinc-700 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-200">
      <p className="font-semibold">Ordering is closed right now.</p>
      <p className="mt-1 text-sm">
        Orders for {status.serviceDateLabel} open {status.reopensLabel}. Check
        back then!
      </p>
    </div>
  );
}
