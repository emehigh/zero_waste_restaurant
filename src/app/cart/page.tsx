"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  offerId: string;
  food: string;
  quantity: number;
  price: number;
};

type Cart = {
  restaurantId: string | null;
  items: CartItem[];
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ restaurantId: null, items: [] });
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  function removeItem(offerId: string) {
    const newItems = cart.items.filter((item) => item.offerId !== offerId);
    setCart({ ...cart, items: newItems });
    localStorage.setItem("cart", JSON.stringify({ ...cart, items: newItems }));
  }

  function clearCart() {
    setCart({ restaurantId: null, items: [] });
    localStorage.setItem("cart", JSON.stringify({ restaurantId: null, items: [] }));
  }

  // Group items by offerId and sum quantities
  const groupedItems = Object.values(
    cart.items.reduce<Record<string, CartItem>>((acc, item) => {
      if (acc[item.offerId]) {
        acc[item.offerId].quantity += item.quantity;
      } else {
        acc[item.offerId] = { ...item };
      }
      return acc;
    }, {})
  );

  const total = groupedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex flex-col items-center p-4">
      <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-lg p-6 mt-8">
        <h1 className="text-2xl font-bold text-green-700 mb-4 text-center">Your Cart</h1>
        {groupedItems.length === 0 ? (
          <div className="text-gray-500 text-center mb-6">Your cart is empty.</div>
        ) : (
          <>
            <ul className="divide-y divide-green-100 mb-4">
              {groupedItems.map((item) => (
                <li key={item.offerId} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-gray-900">{item.food}</div>
                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-700 font-bold">{item.price} RON</span>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => removeItem(item.offerId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-green-700 text-lg">{total} RON</span>
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => alert("Checkout not implemented")}
              >
                Checkout
              </button>
            </div>
          </>
        )}
        <button
          className="mt-6 text-green-700 underline block mx-auto"
          onClick={() => router.back()}
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
}