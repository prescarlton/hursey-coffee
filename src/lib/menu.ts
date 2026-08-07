import "server-only";
import { prisma } from "@/lib/db";

/** All menu items — shown on the storefront and managed in the back-office. */
export function getMenuItems() {
  return prisma.menuItem.findMany({ orderBy: { name: "asc" } });
}

/** Fetch specific menu items by id — used to re-price a cart server-side. */
export function getMenuItemsByIds(ids: string[]) {
  return prisma.menuItem.findMany({ where: { id: { in: ids } } });
}

export type MenuItemInput = {
  name: string;
  priceCents: number;
};

export function createMenuItem(input: MenuItemInput) {
  return prisma.menuItem.create({ data: input });
}

export function updateMenuItem(id: string, input: MenuItemInput) {
  return prisma.menuItem.update({ where: { id }, data: input });
}

export function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({ where: { id } });
}
