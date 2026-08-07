// Friday pickup time slots. Parents choose one at checkout so the team can
// stagger the car-rider line and know which coffees to have ready when.
// Values are canonical 24h "HH:mm" strings (sortable); labels are 12h display.
// Widen the window by adjusting START / END / STEP_MIN.

const START = "07:00";
const END = "07:30";
const STEP_MIN = 5;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toValue(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toLabel(totalMin: number): string {
  const h24 = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export type PickupTime = { value: string; label: string };

export const PICKUP_TIMES: PickupTime[] = (() => {
  const slots: PickupTime[] = [];
  for (let t = toMinutes(START); t <= toMinutes(END); t += STEP_MIN) {
    slots.push({ value: toValue(t), label: toLabel(t) });
  }
  return slots;
})();

export const PICKUP_TIME_VALUES: string[] = PICKUP_TIMES.map((s) => s.value);

/** Display a stored "HH:mm" value as a 12h label; falls back to the raw value. */
export function formatPickupTime(value: string): string {
  return PICKUP_TIMES.find((s) => s.value === value)?.label ?? value;
}
