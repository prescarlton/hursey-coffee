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

/**
 * Where an order is handed off: a parking space + car for curbside orders, or
 * a delivery location for teacher orders.
 */
export function formatHandoff(order: {
  teacherLocation: string | null;
  parkingSpace: number | null;
  carColor: string | null;
  carType: string | null;
}): { isTeacher: boolean; where: string; car: string } {
  if (order.teacherLocation) {
    return { isTeacher: true, where: order.teacherLocation, car: "—" };
  }
  return {
    isTeacher: false,
    where: `Space ${order.parkingSpace}`,
    car: `${order.carColor} ${order.carType}`,
  };
}
