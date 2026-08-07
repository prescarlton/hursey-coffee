"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-context";

/** Clears the cart once, on mount — rendered on the order confirmation page. */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // Run once on mount; clear is stable enough for this purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
