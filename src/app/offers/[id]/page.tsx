"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Offer = {
  id: string;
  food: string;
  quantity: number;
  unit: string;
  price: number;
  postedAt: string;
};

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

export default function RestaurantOffersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurant, setRestaurant] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart>({ restaurantId: null, items: [] });
  const [showCartInfo, setShowCartInfo] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<CartItem | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/restaurant-offers?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOffers(data.offers || []);
        setRestaurant(data.restaurant || null);
        setLoading(false);
      });
  }, [id]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function handleAddToCart(offer: Offer) {
    // If cart is empty or for this restaurant, add
    if (!cart.restaurantId || cart.restaurantId === id) {
      setCart({
        restaurantId: id as string,
        items: [...cart.items, { offerId: offer.id, food: offer.food, quantity: 1, price: offer.price }],
      });
    } else {
      // Ask if user wants to start a new order
      setPendingOffer({ offerId: offer.id, food: offer.food, quantity: 1, price: offer.price });
      setShowCartInfo(true);
    }
  }

  function startNewOrder() {
    if (pendingOffer) {
      setCart({
        restaurantId: id as string,
        items: [pendingOffer],
      });
      setShowCartInfo(false);
      setPendingOffer(null);
    }
  }

  function cancelSwitch() {
    setShowCartInfo(false);
    setPendingOffer(null);
  }

   return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-lg p-6 mt-8">
        {/* Back button */}
        <button
          className="mb-4 text-green-700 hover:underline flex items-center gap-1"
          onClick={() => router.back()}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-green-700 mb-2 text-center">
          {restaurant?.name || restaurant?.email || "Restaurant"}
        </h1>
        <p className="text-center text-gray-500 mb-6">{restaurant?.email}</p>
        {loading ? (
          <div className="text-gray-700 text-center">Loading...</div>
        ) : offers.length === 0 ? (
          <div className="text-gray-500 text-center">No offers available.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-col sm:flex-row items-center justify-between bg-green-50 rounded-xl p-4 shadow border border-green-100"
              >
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900">{offer.food}</div>
                  <div className="text-gray-700 text-sm">
                    {offer.quantity} {offer.unit}
                  </div>
                  <div className="text-xs text-gray-400">
                    Posted: {new Date(offer.postedAt).toLocaleString("en-GB")}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 mt-2 sm:mt-0">
                  <div className="text-green-700 font-bold text-xl">{offer.price} RON</div>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleAddToCart(offer)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Info Modal for switching restaurant */}
      {showCartInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full text-center">
            <h2 className="text-lg font-bold text-green-700 mb-4">Start a new order?</h2>
            <p className="mb-6 text-gray-700">
              Your cart contains items from another restaurant.<br />
              Do you want to start a new order? This will empty your cart.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={cancelSwitch}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={startNewOrder}
              >
                Start New Order
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fixed Cart Button (visible on mobile only) */}
     <button
        className="fixed bottom-6 right-6 z-50 bg-green-600 text-white rounded-full shadow-lg px-6 py-3 font-bold text-lg flex items-center gap-2 md:hidden"
        onClick={() => router.push("/cart")}
        aria-label="View cart"
      >
        🛒 Cart
        {cart.items.length > 0 && (
          <span className="ml-2 bg-white text-green-700 font-bold rounded-full px-2 py-0.5 text-sm shadow inline-block">
            {cart.items.length}
          </span>
        )}
      </button>
    </div>
  );
}