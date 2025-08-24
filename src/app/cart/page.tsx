"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CartItem = {
  offerId: string;
  food: string;
  quantity: number;
  price: number;
  unit: string;
  maxQuantity: number;
  imageUrl?: string;
  description?: string;
  calories?: number;
  allergens?: string[];
};

type Cart = {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ restaurantId: null, restaurantName: null, items: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    console.log("Aiceaa", stored);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        setCart({ restaurantId: null, restaurantName: null, items: [] });
      }
    }
    setLoading(false);
  }, []);

  function updateCart(newCart: Cart) {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function removeItem(offerId: string) {
    const newItems = cart.items.filter((item) => item.offerId !== offerId);
    updateCart({ ...cart, items: newItems });
  }

  function updateQuantity(offerId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      removeItem(offerId);
      return;
    }

    const newItems = cart.items.map((item) => 
      item.offerId === offerId 
        ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) }
        : item
    );
    updateCart({ ...cart, items: newItems });
  }

  function clearCart() {
    updateCart({ restaurantId: null, restaurantName: null, items: [] });
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
  const totalItems = groupedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {groupedItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6m-8 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious food items to get started!</p>
            <button
              onClick={() => router.push('/offers')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Items from {cart.restaurantName || "Restaurant"}
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-4">
                  {groupedItems.map((item) => (
                    <div key={item.offerId} className="flex gap-4 p-4 border border-gray-100 rounded-xl">
                      {/* Food Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.food}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.food}</h3>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                        )}
                        
                        {/* Item Info */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                          <span className="font-medium text-green-600">{item.price.toFixed(2)} RON</span>
                          {item.calories && (
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {item.calories} cal
                            </span>
                          )}
                        </div>

                        {/* Allergens */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.allergens.slice(0, 3).map((allergen) => (
                              <span key={allergen} className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs">
                                ⚠️ {allergen}
                              </span>
                            ))}
                            {item.allergens.length > 3 && (
                              <span className="text-xs text-gray-500">+{item.allergens.length - 3} more</span>
                            )}
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.offerId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                            
                            <div className="text-center min-w-[60px]">
                              <div className="font-semibold">{item.quantity}</div>
                              <div className="text-xs text-gray-500">{item.unit}</div>
                            </div>
                            
                            <button
                              onClick={() => updateQuantity(item.offerId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                                item.quantity >= item.maxQuantity 
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {(item.price * item.quantity).toFixed(2)} RON
                            </div>
                            <button
                              onClick={() => removeItem(item.offerId)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({totalItems})</span>
                    <span className="font-medium">{total.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <hr className="border-gray-200"/>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{total.toFixed(2)} RON</span>
                  </div>
                </div>

                <button
                  onClick={() => alert("Checkout functionality coming soon!")}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition text-lg"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push(`/offers/${cart.restaurantId}`)}
                    className="text-green-600 hover:underline text-sm"
                  >
                    Add more items
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}