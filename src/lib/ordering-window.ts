// Weekly ordering window for the Friday-morning fundraiser.
//
// Ordering is OPEN all week and CLOSES Thursday 10:00 PM. Coffee is served the
// next morning (Friday 7:00–7:30 pickup), and ordering REOPENS Friday 3:00 PM
// for the following Friday. So the closed window is Thu 22:00 → Fri 15:00,
// which covers the Friday service.
//
// All times are wall-clock in FUNDRAISER_TIMEZONE (default America/New_York),
// computed via Intl so it's correct regardless of the server's timezone.

const DEFAULT_TZ = "America/New_York";

// Cutoff: Thursday 22:00. Reopen: Friday 15:00. (Weekday: Sun=0 … Sat=6.)
const THURSDAY = 4;
const FRIDAY = 5;
const CUTOFF_MINUTES = 22 * 60; // Thu 10:00 PM
const REOPEN_MINUTES = 15 * 60; // Fri 3:00 PM

function timeZone(): string {
  return process.env.FUNDRAISER_TIMEZONE || DEFAULT_TZ;
}

type Parts = {
  weekday: number; // 0=Sun … 6=Sat
  year: number;
  month: number; // 1-12
  day: number;
  minutes: number; // minutes since local midnight
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Wall-clock parts of `instant` in the fundraiser timezone. */
function partsInZone(instant: Date): Parts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone(),
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p: Record<string, string> = {};
  for (const part of fmt.formatToParts(instant)) {
    if (part.type !== "literal") p[part.type] = part.value;
  }
  // hour can be "24" at midnight in some environments; normalize to 0.
  const hour = Number(p.hour) % 24;
  return {
    weekday: WEEKDAY_INDEX[p.weekday] ?? 0,
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    minutes: hour * 60 + Number(p.minute),
  };
}

/** Add `days` to a calendar date, returning "YYYY-MM-DD" (DST-safe via UTC). */
function addDays(year: number, month: number, day: number, days: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Format a "YYYY-MM-DD" as e.g. "Friday, August 8" in the fundraiser zone. */
export function formatServiceDate(serviceDate: string): string {
  // Anchor at noon UTC so the calendar day can't shift under the timezone.
  const d = new Date(`${serviceDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone(),
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(d);
}

export type OrderingStatus = {
  open: boolean;
  /** The Friday this cycle serves, "YYYY-MM-DD". */
  serviceDate: string;
  /** e.g. "Friday, August 8". */
  serviceDateLabel: string;
  /** When open: e.g. "Thursday, August 7 at 10:00 PM". */
  closesLabel: string;
  /** When closed: e.g. "Friday, August 8 at 3:00 PM". */
  reopensLabel: string;
};

/**
 * The Friday whose batch is currently active — the batch a new order joins and
 * the batch the admin is preparing. Flips to next week only once Friday 3:00 PM
 * reopening passes.
 */
function serviceDateFor(p: Parts): string {
  let daysUntilFriday: number;
  if (p.weekday === FRIDAY) {
    daysUntilFriday = p.minutes >= REOPEN_MINUTES ? 7 : 0;
  } else {
    daysUntilFriday = (FRIDAY - p.weekday + 7) % 7;
  }
  return addDays(p.year, p.month, p.day, daysUntilFriday);
}

export function getOrderingStatus(now: Date = new Date()): OrderingStatus {
  const p = partsInZone(now);

  const closed =
    (p.weekday === THURSDAY && p.minutes >= CUTOFF_MINUTES) ||
    (p.weekday === FRIDAY && p.minutes < REOPEN_MINUTES);

  const serviceDate = serviceDateFor(p);

  // The Thursday before this service Friday (cutoff) and the reopening Friday.
  const thursdayBefore = addDays(
    ...(serviceDate.split("-").map(Number) as [number, number, number]),
    -1,
  );

  return {
    open: !closed,
    serviceDate,
    serviceDateLabel: formatServiceDate(serviceDate),
    closesLabel: `${formatServiceDate(thursdayBefore)} at 10:00 PM`,
    reopensLabel: `${formatServiceDate(serviceDate)} at 3:00 PM`,
  };
}
