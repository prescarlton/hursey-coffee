import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to your .env to use the admin panel.",
    );
  }
  return pw;
}

/** Stateless session token derived from the password — recomputable, no store. */
function expectedToken(): string {
  return crypto
    .createHmac("sha256", getPassword())
    .update("hursey-admin-v1")
    .digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** True if the submitted password matches ADMIN_PASSWORD (constant-time). */
export function verifyPassword(input: string): boolean {
  return timingSafeEqual(input, getPassword());
}

/** Set the admin session cookie. Call only from a Server Action / Route Handler. */
export async function signIn(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Clear the admin session cookie. */
export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Whether the current request carries a valid admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return false;
    return timingSafeEqual(token, expectedToken());
  } catch {
    // ADMIN_PASSWORD unset → treat as locked.
    return false;
  }
}

/** Redirect to the login page unless the request is authenticated. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}
