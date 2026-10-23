/** Format an integer number of cents as a USD string, e.g. 475 -> "$4.75". */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Format when an order was placed, e.g. "Oct 22, 7:14 AM", in local time. */
export function formatOrderTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: process.env.FUNDRAISER_TIMEZONE || "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Format a short order number for display, e.g. 1042 -> "#1042". */
export function formatOrderNumber(orderNumber: number): string {
  return `#${orderNumber}`;
}
