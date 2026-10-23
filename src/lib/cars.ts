// Shared, non-secret constants used by the checkout form (client) and validation
// (server) for curbside handoff: where the customer parks and what their car
// looks like.

export const CAR_COLORS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Tan / Gold",
  "Brown",
  "Other",
] as const;

export const CAR_TYPES = [
  "Sedan",
  "SUV",
  "Minivan",
  "Truck",
  "Van",
  "Coupe",
  "Hatchback",
  "Other",
] as const;

/** Numbered parking spaces customers can pull into. */
export const PARKING_SPACES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type CarColor = (typeof CAR_COLORS)[number];
export type CarType = (typeof CAR_TYPES)[number];
