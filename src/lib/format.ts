/** Format an integer number of cents as a USD string, e.g. 475 -> "$4.75". */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Format a short order number for display, e.g. 1042 -> "#1042". */
export function formatOrderNumber(orderNumber: number): string {
  return `#${orderNumber}`;
}
