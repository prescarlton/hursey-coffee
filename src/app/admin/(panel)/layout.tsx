import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logout } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/admin/orders" className="font-bold tracking-tight">
            ☕ Hursey Coffee · Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/orders" className="hover:underline">
              Orders
            </Link>
            <Link href="/admin/menu" className="hover:underline">
              Menu
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-black/15 px-3 py-1.5 hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
