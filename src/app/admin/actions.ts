"use server";

import { redirect } from "next/navigation";
import { verifyPassword, signIn, signOut, requireAdmin } from "@/lib/admin-auth";

export type LoginState = { error?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  let ok = false;
  try {
    ok = verifyPassword(password);
  } catch {
    return { error: "Admin password is not configured on the server." };
  }

  if (!ok) {
    return { error: "Incorrect password." };
  }

  await signIn();
  redirect("/admin/orders");
}

export async function logout(): Promise<void> {
  await requireAdmin();
  await signOut();
  redirect("/admin/login");
}
