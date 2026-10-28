import "server-only";
import { prisma } from "@/lib/db";

export type NewOrderItem = {
  menuItemId: string;
  nameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
};

export type NewOrder = {
  customerName: string;
  carColor: string | null;
  carType: string | null;
  parkingSpace: number | null;
  teacherLocation: string | null;
  totalCents: number;
  items: NewOrderItem[];
};

/** Create an order with its snapshotted line items. */
export function createOrder(input: NewOrder) {
  return prisma.order.create({
    data: {
      customerName: input.customerName,
      carColor: input.carColor,
      carType: input.carType,
      parkingSpace: input.parkingSpace,
      teacherLocation: input.teacherLocation,
      totalCents: input.totalCents,
      items: { create: input.items },
    },
  });
}

/** All orders, newest first. */
export function getOrders() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Load an order (with its line items) by id. */
export function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}
