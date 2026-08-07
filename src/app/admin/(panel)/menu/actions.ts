"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  type MenuItemInput,
} from "@/lib/menu";

function parseItem(formData: FormData): MenuItemInput {
  const name = String(formData.get("name") ?? "").trim();
  const dollars = parseFloat(String(formData.get("price") ?? ""));

  return {
    name,
    priceCents: Number.isFinite(dollars) ? Math.round(dollars * 100) : 0,
  };
}

/** Reflect menu changes on both the admin page and the public storefront. */
function revalidateMenu() {
  revalidatePath("/admin/menu");
  revalidatePath("/");
}

export async function createMenuItemAction(formData: FormData) {
  await requireAdmin();
  const item = parseItem(formData);
  if (!item.name) return;
  await createMenuItem(item);
  revalidateMenu();
}

export async function updateMenuItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const item = parseItem(formData);
  if (!item.name) return;
  await updateMenuItem(id, item);
  revalidateMenu();
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // Always succeeds: the OrderItem FK is ON DELETE SET NULL, so past orders keep
  // their name/price snapshots while this menu item is removed.
  await deleteMenuItem(id);
  revalidateMenu();
}
