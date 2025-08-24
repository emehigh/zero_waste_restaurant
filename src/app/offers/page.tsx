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

type Restaurant = {
  id: string;
  name: string;
  logoUrl?: string;
  cropY?: number;
  cropX?: number;
  offerCount: number;
  averageRating?: number;
  totalReviews?: number;
  tags?: string[];
};

export default function OffersPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart>({ restaurantId: null, restaurantName: null, items: [] });
  const [pendingRestaurant, setPendingRestaurant] = useState<string | null>(null);
  const [showCartInfo, setShowCartInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const router = useRouter();

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    console.log("bbb", stored);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        setCart({ restaurantId: null, restaurantName: null, items: [] });
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (cart.items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    // Fetch restaurants with offers
    fetch("/api/restaurants-with-offers")
      .then((res) => res.json())
      .then(async (data) => {
        const restaurantList = data.restaurants || [];
        
        // Fetch reviews for each restaurant
        const restaurantsWithReviews = await Promise.all(
          restaurantList.map(async (restaurant: Restaurant) => {
            try {
              const reviewsRes = await fetch(`/api/restaurant-offers/reviews/${restaurant.id}`);
              const reviewsData = await reviewsRes.json();
              
              return {
                ...restaurant,
                averageRating: reviewsData.restaurant?.averageRating || 4.5,
                totalReviews: reviewsData.restaurant?.totalReviews || 0,
                tags: ["Pickup ready", "Eco-friendly", "Fresh daily"].filter(() => Math.random() > 0.5)
              };
            } catch (error) {
              console.error(`Failed to fetch reviews for ${restaurant.name}:`, error);
              return {
                ...restaurant,
                averageRating: 4.5,
                totalReviews: 0,
                tags: ["Pickup ready"]
              };
            }
          })
        );
        
        setRestaurants(restaurantsWithReviews);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch restaurants:', error);
        setLoading(false);
      });
  }, []);

  function handleRestaurantClick(id: string, name: string) {
    if (!cart.restaurantId || cart.restaurantId === id) {
      router.push(`/offers/${id}`);
    } else {
      setPendingRestaurant(id);
      setShowCartInfo(true);
    }
  }

  function startNewOrder() {
    if (pendingRestaurant) {
      setCart({ restaurantId: null, restaurantName: null, items: [] });
      setShowCartInfo(false);
      router.push(`/offers/${pendingRestaurant}`);
      setPendingRestaurant(null);
    }
  }

  function cancelSwitch() {
    setShowCartInfo(false);
    setPendingRestaurant(null);
  }

  // Filter restaurants based on search
  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filters = ["All", "Pickup ready", "Fresh daily", "Eco-friendly", "High rated"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-green-600">
                <path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1zM10 6a2 2 0 014 0v1h-4V6zm8 13a1 1 0 01-1 1H7a1 1 0 01-1-1V9h2v1a1 1 0 002 0V9h4v1a1 1 0 002 0V9h2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pickup only
            </h1>
            <div className="flex-1"></div>
            {cart.items.length > 0 && (
              <button
                onClick={() => router.push('/cart')}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6m-8 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
                selectedFilter === filter
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-green-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200"
                onClick={() => handleRestaurantClick(restaurant.id, restaurant.name)}
              >
                {/* Restaurant Image */}
                <div className="relative w-full h-48 overflow-hidden">
                  {restaurant.logoUrl ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${restaurant.logoUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{restaurant.name[0]}</span>
                    </div>
                  )}
                  
                  {/* Ready for pickup badge */}
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Ready for pickup
                  </div>
                  
                  {/* Tags */}
                  {restaurant.tags && restaurant.tags.length > 0 && (
                    <div className="absolute top-3 right-3">
                      {restaurant.tags.slice(0, 1).map((tag) => (
                        <span key={tag} className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{restaurant.name}</h3>
                    <div className="flex items-center gap-1 ml-2">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-yellow-400">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {restaurant.averageRating?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                  </div>

                  {/* Pickup info and reviews */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-green-600">
                        <path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-green-600 font-medium">Pickup available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>
                        {restaurant.totalReviews || 0} reviews
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" className="text-blue-600">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ready in 15-30 min
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {restaurant.offerCount} offer{restaurant.offerCount !== 1 ? 's' : ''} available
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 max-w-sm mx-auto z-50">
          <button
            onClick={() => router.push('/cart')}
            className="w-full bg-green-600 text-white rounded-2xl p-4 shadow-2xl hover:bg-green-700 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {totalItems}
              </div>
              <span className="font-semibold">Ready for pickup</span>
            </div>
            <span className="font-bold text-lg">{totalPrice.toFixed(2)} RON</span>
          </button>
        </div>
      )}

      {/* Cart Switch Modal */}
      {showCartInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-orange-600">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Switch restaurant?</h2>
              <p className="text-gray-600">
                Your cart contains items from <strong>{cart.restaurantName}</strong>. Starting a new order will clear your current cart.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                onClick={cancelSwitch}
              >
                Keep current cart
              </button>
              <button
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                onClick={startNewOrder}
              >
                Switch restaurant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}