"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { setOrderCompleted } from "@/lib/orders";

export async function setOrderCompletedAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await setOrderCompleted(id, formData.get("completed") === "1");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/print");
}
