// Weekly ordering window. Orders are only accepted inside this window; the
// checkout action enforces it and the storefront reflects it.
//
// To change when ordering is open, edit ORDERING_WINDOW below. Times are
// wall-clock in FUNDRAISER_TIMEZONE (default America/New_York), computed via
// Intl so they're correct regardless of the server's timezone.

export const ORDERING_WINDOW = {
  weekday: 5, // 0=Sun … 6=Sat (5 = Friday)
  start: "06:45", // 24h local time, inclusive
  end: "07:30", // 24h local time, exclusive (closed from 7:30:00 on)
};

const DEFAULT_TZ = "America/New_York";

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

/** Format a "YYYY-MM-DD" as e.g. "Friday, October 24". */
function formatDate(date: string): string {
  // Anchor at noon UTC so the calendar day can't shift under the timezone.
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone(),
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** "06:45" -> "6:45 AM". */
function toLabel(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export type OrderingStatus = {
  open: boolean;
  /** When open: e.g. "7:30 AM". */
  closesLabel: string;
  /** Next opening, e.g. "Friday, October 24 at 6:45 AM". */
  opensLabel: string;
};

export function getOrderingStatus(now: Date = new Date()): OrderingStatus {
  const p = partsInZone(now);
  const start = toMinutes(ORDERING_WINDOW.start);
  const end = toMinutes(ORDERING_WINDOW.end);

  const open =
    p.weekday === ORDERING_WINDOW.weekday &&
    p.minutes >= start &&
    p.minutes < end;

  // Next opening: later today if the window hasn't started yet, otherwise the
  // next matching weekday.
  let daysUntil = (ORDERING_WINDOW.weekday - p.weekday + 7) % 7;
  if (daysUntil === 0 && p.minutes >= start) daysUntil = 7;
  const nextOpenDate = addDays(p.year, p.month, p.day, daysUntil);

  return {
    open,
    closesLabel: toLabel(ORDERING_WINDOW.end),
    opensLabel: `${formatDate(nextOpenDate)} at ${toLabel(ORDERING_WINDOW.start)}`,
  };
}
