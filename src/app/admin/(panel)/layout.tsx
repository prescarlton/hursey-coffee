import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logout } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

// Same size as the admin primary buttons (h-10, px-5), ghost style.
const ghostButton =
  "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium hover:bg-black/[.04] dark:hover:bg-white/[.06]";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950 print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
          <Link href="/admin/orders" className="font-bold tracking-tight">
            ☕ Bulldog Brews · Admin
          </Link>
          <nav className="-mr-5 flex items-center gap-1">
            <Link href="/admin/orders" className={ghostButton}>
              Orders
            </Link>
            <Link href="/admin/menu" className={ghostButton}>
              Menu
            </Link>
            <form action={logout}>
              <button type="submit" className={ghostButton}>
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
