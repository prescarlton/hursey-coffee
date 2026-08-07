import "server-only";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/client";

export type NewOrderItem = {
  menuItemId: string;
  nameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
};

export type NewOrder = {
  customerName: string;
  carColor: string;
  carType: string;
  kidName: string;
  teacherName: string;
  pickupTime: string;
  totalCents: number;
  items: NewOrderItem[];
};

/** Create an order in PENDING status with its snapshotted line items. */
export function createPendingOrder(input: NewOrder) {
  return prisma.order.create({
    data: {
      customerName: input.customerName,
      carColor: input.carColor,
      carType: input.carType,
      kidName: input.kidName,
      teacherName: input.teacherName,
      pickupTime: input.pickupTime,
      totalCents: input.totalCents,
      status: OrderStatus.PENDING,
      items: { create: input.items },
    },
  });
}

/** All paid orders with their items, ordered for the Friday pickup line. */
export function getPaidOrders() {
  return prisma.order.findMany({
    where: { status: OrderStatus.PAID },
    include: { items: true },
    orderBy: [{ pickupTime: "asc" }, { orderNumber: "asc" }],
  });
}

/** Load an order (with its line items) by its Stripe Checkout session id. */
export function getOrderByStripeSession(stripeSessionId: string) {
  return prisma.order.findUnique({
    where: { stripeSessionId },
    include: { items: true },
  });
}

/** Record the Stripe Checkout session id on an order. */
export function attachStripeSession(orderId: string, stripeSessionId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { stripeSessionId },
  });
}

/** Mark an order paid once Stripe confirms it via webhook. Idempotent. */
export function markOrderPaid(
  stripeSessionId: string,
  stripePaymentIntentId: string | null,
) {
  return prisma.order.updateMany({
    where: { stripeSessionId, status: OrderStatus.PENDING },
    data: { status: OrderStatus.PAID, stripePaymentIntentId },
  });
}
