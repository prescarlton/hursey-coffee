import { requireAdmin } from "@/lib/admin-auth";
import { getMenuItems } from "@/lib/menu";
import { MenuManager } from "@/components/admin/menu-manager";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireAdmin();
  const items = await getMenuItems();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">
        Add drinks or change prices. Changes show up for shoppers right away.
      </p>
      <MenuManager
        items={items.map(({ id, name, priceCents }) => ({
          id,
          name,
          priceCents,
        }))}
      />
    </div>
  );
}
