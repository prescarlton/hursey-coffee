"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "hursey-coffee-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // Persist on change (after initial hydration so we don't clobber storage).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);
    const totalCents = items.reduce((n, i) => n + i.priceCents * i.quantity, 0);

    return {
      items,
      itemCount,
      totalCents,
      addItem: (item, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return prev.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            );
          }
          return [...prev, { ...item, quantity }];
        }),
      setQuantity: (menuItemId, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.menuItemId !== menuItemId)
            : prev.map((i) =>
                i.menuItemId === menuItemId ? { ...i, quantity } : i,
              ),
        ),
      removeItem: (menuItemId) =>
        setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
