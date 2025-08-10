"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function CartButton() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const cart = JSON.parse(stored);
        setCartCount(Array.isArray(cart.items) ? cart.items.length : 0);
      } catch {
        setCartCount(0);
      }
    }
    const handler = () => {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          const cart = JSON.parse(stored);
          setCartCount(Array.isArray(cart.items) ? cart.items.length : 0);
        } catch {
          setCartCount(0);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <>
      {/* Mobile: fixed button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-green-600 text-white rounded-full shadow-lg px-6 py-3 font-bold text-lg flex items-center gap-2 md:hidden"
        onClick={() => router.push("/cart")}
        aria-label="View cart"
      >
        🛒 Cart
        {cartCount > 0 && (
          <span className="ml-2 bg-white text-green-700 font-bold rounded-full px-2 py-0.5 text-sm shadow inline-block">
            {cartCount}
          </span>
        )}
      </button>
      {/* Desktop: top-right button */}
      <button
        className="hidden md:flex fixed top-6 right-8 z-40 bg-green-600 text-white rounded-full shadow-lg px-6 py-3 font-bold text-lg items-center gap-2 hover:bg-green-700 transition"
        onClick={() => router.push("/cart")}
        aria-label="View cart"
      >
        🛒 Cart
        {cartCount > 0 && (
          <span className="ml-2 bg-white text-green-700 font-bold rounded-full px-2 py-0.5 text-sm shadow inline-block">
            {cartCount}
          </span>
        )}
      </button>
    </>
  );
}

export default function CartButtonWrapper() {
  const { data: session } = useSession();
  const isCustomer = session?.user?.role === "CUSTOMER";
  if (!session || !isCustomer) return null;
  return <CartButton />;
}