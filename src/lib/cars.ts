// Shared, non-secret constants used by the checkout form (client) and validation
// (server) to describe the parent's car for curbside handoff.

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

export type CarColor = (typeof CAR_COLORS)[number];
export type CarType = (typeof CAR_TYPES)[number];
