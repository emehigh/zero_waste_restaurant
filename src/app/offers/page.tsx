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

type Restaurant = {
  id: string;
  name: string;
  logoUrl?: string;
  cropY?: number;
  cropX?: number;
  offerCount: number;
};

export default function OffersPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState<Cart>({ restaurantId: null, items: [] });
  const [pendingRestaurant, setPendingRestaurant] = useState<string | null>(null);
  const [showCartInfo, setShowCartInfo] = useState(false);
  const router = useRouter();

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch("/api/restaurants-with-offers")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      });
  }, []);

  function handleRestaurantClick(id: string) {
    if (!cart.restaurantId || cart.restaurantId === id) {
      router.push(`/offers/${id}`);
    } else {
      setPendingRestaurant(id);
      setShowCartInfo(true);
    }
  }

  function startNewOrder() {
    if (pendingRestaurant) {
      setCart({ restaurantId: null, items: [] });
      setShowCartInfo(false);
      router.push(`/offers/${pendingRestaurant}`);
      setPendingRestaurant(null);
    }
  }

  function cancelSwitch() {
    setShowCartInfo(false);
    setPendingRestaurant(null);
  }

return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-green-50 via-green-100 to-green-200 relative">
      {/* ...sidebar code... */}

      <main className="flex-1 flex flex-col items-center p-4 md:p-10 relative">
        {/* ...background and heading... */}

        <h1 className="text-3xl font-bold text-green-700 mb-6">Browse Restaurants</h1>
        
        {/* Restaurant list */}
       {loading ? (
  <div className="text-gray-700 z-10">Loading...</div>
) : (
  <div className="flex flex-col gap-6 items-center w-full z-10">
    {restaurants.map((r) => (
  <div
    key={r.id}
    className="flex items-center rounded-2xl shadow-lg hover:shadow-2xl transition p-4 gap-4 cursor-pointer border border-green-100 hover:border-green-400 bg-transparent relative mx-auto"
    onClick={() => handleRestaurantClick(r.id)}
    tabIndex={0}
    onKeyDown={e => { if (e.key === "Enter") handleRestaurantClick(r.id); }}
    role="button"
    aria-label={`See offers for ${r.name}`}
    style={{
      width: "100%",
      maxWidth: "1000px",
      height: "200px",
      minWidth: "0",
    }}
  >
    {/* Background image absolutely positioned */}
    <div
      className="absolute inset-0 w-full h-full rounded-2xl z-0"
      style={
        r.logoUrl
          ? {
              backgroundImage: `url(${r.logoUrl})`,
              backgroundSize: "cover",
              backgroundPosition: `-${r.cropX || 0}px -${r.cropY || 0}px`,
              backgroundRepeat: "no-repeat",
              filter: "brightness(0.85)",
            }
          : { background: "#bbf7d0" }
      }
    />
    {/* Content on top of background */}
    <div className="relative z-10 flex items-center w-full h-full">
      <div className="flex-1 ml-4 min-w-0">
        <div className="font-bold text-2xl text-gray-900 truncate">{r.name}</div>
        <div className="text-green-700 text-md">
          {r.offerCount} offer{r.offerCount !== 1 ? "s" : ""}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-green-600 font-semibold">See offers</span>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
    {/* Overlay for name if no logo */}
    {!r.logoUrl && (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span className="text-6xl font-bold text-green-700">{r.name[0]}</span>
      </div>
    )}
  </div>
))}
  </div>
)}

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
      </main>
    </div>
  );
}