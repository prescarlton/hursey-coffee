import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/site-header";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </CartProvider>
  );
}
