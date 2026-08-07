import { z } from "zod";
import { CAR_COLORS, CAR_TYPES } from "@/lib/cars";
import { PICKUP_TIME_VALUES } from "@/lib/pickup";

const carColorSchema = z
  .string()
  .refine((v) => (CAR_COLORS as readonly string[]).includes(v), {
    message: "Please choose your car color",
  });

const carTypeSchema = z
  .string()
  .refine((v) => (CAR_TYPES as readonly string[]).includes(v), {
    message: "Please choose your car type",
  });

/** A single line item as sent from the client cart (price is NOT trusted). */
export const cartItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

/** Full checkout payload assembled from the form + hidden cart field. */
export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Please enter your name"),
  carColor: carColorSchema,
  carType: carTypeSchema,
  kidName: z.string().trim().min(1, "Please enter your child's name"),
  teacherName: z.string().trim().min(1, "Please enter the teacher's name"),
  pickupTime: z
    .string()
    .refine((v) => PICKUP_TIME_VALUES.includes(v), {
      message: "Please choose a pickup time",
    }),
  cart: z.array(cartItemSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Flatten a ZodError into a { fieldName: firstMessage } map for the form UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
