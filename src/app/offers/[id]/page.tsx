"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type Offer = {
  id: string;
  food: string;
  quantity: number;
  unit: string;
  price: number;
  postedAt: string;
  foodItem?: {
    imageUrl: string;
    description: string;
    calories: number;
    protein: number;
    allergens: string[];
    category: string;
  };
};

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
  name: string;
  email: string;
  logoUrl?: string;
  cropY?: number;
  cropX?: number;
  averageRating?: number;
  totalReviews?: number;
};

export default function RestaurantOffersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart>({ restaurantId: null, restaurantName: null, items: [] });
  const [showCartInfo, setShowCartInfo] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<CartItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (!id) return;
    
    // Fetch both restaurant offers and reviews data
    Promise.all([
      fetch(`/api/restaurant-offers?id=${id}`).then(res => res.json()),
      fetch(`/api/restaurant-offers/reviews/${id}`).then(res => res.json())
    ]).then(([offersData, reviewsData]) => {
      setOffers(offersData.offers || []);
      
      // Combine restaurant data from both endpoints
      const restaurantInfo = {
        ...offersData.restaurant,
        averageRating: reviewsData.restaurant?.averageRating || 4.5,
        totalReviews: reviewsData.restaurant?.totalReviews || 0
      };
      
      setRestaurant(restaurantInfo);
      setLoading(false);

    }).catch(error => {
      console.error('Failed to fetch data:', error);
      // Fallback to just offers data
      fetch(`/api/restaurant-offers?id=${id}`)
        .then(res => res.json())
        .then(data => {
          setOffers(data.offers || []);
          setRestaurant({
            ...data.restaurant,
            averageRating: 4.5,
            totalReviews: 0
          });
          setLoading(false);
        });
    });
  }, [id]);

  // Load cart from localStorage on mount
  useEffect(() => {
  const stored = localStorage.getItem("cart");
  console.log("aaa", stored);
  if (stored) {
    try {
      console.log("mata");
      setCart(JSON.parse(stored));
    } catch {
      console.log("wtfff");
      setCart({ restaurantId: null, restaurantName: null, items: [] });
    }
  } else {
    console.log("tactu");
    setCart({ restaurantId: null, restaurantName: null, items: [] });
  }
}, [id]); // <-- add id here

  // Save cart to localStorage on change
  useEffect(() => {
    if (cart.items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  function handleAddToCart(offer: Offer) {
    const cartItem: CartItem = {
      offerId: offer.id,
      food: offer.food,
      quantity: 1,
      price: offer.price,
      unit: offer.unit,
      maxQuantity: offer.quantity, // Store the available quantity
      imageUrl: offer.foodItem?.imageUrl,
      description: offer.foodItem?.description,
      calories: offer.foodItem?.calories,
      allergens: offer.foodItem?.allergens,
    };

    if (!cart.restaurantId || cart.restaurantId === id) {
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item => item.offerId === offer.id);
      
      if (existingItemIndex >= 0) {
        // Increase quantity if item exists and doesn't exceed available quantity
        const updatedItems = [...cart.items];
        const currentQuantity = updatedItems[existingItemIndex].quantity;
        
        if (currentQuantity < offer.quantity) {
          updatedItems[existingItemIndex].quantity += 1;
          setCart({
            restaurantId: id as string,
            restaurantName: restaurant?.name || null,
            items: updatedItems,
          });
        } else {
          alert(`Only ${offer.quantity} ${offer.unit} available for ${offer.food}`);
        }
      } else {
        // Add new item to cart
        setCart({
          restaurantId: id as string,
          restaurantName: restaurant?.name || null,
          items: [...cart.items, cartItem],
        });
      }
    } else {
      // Different restaurant - ask to replace cart
      setPendingOffer(cartItem);
      setShowCartInfo(true);
    }
  }

  function startNewOrder() {
    if (pendingOffer) {
      setCart({
        restaurantId: id as string,
        restaurantName: restaurant?.name || null,
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

  const categories = ["All", ...Array.from(new Set(offers.map(o => o.foodItem?.category).filter((c): c is string => typeof c === "string")))];
  const filteredOffers = selectedCategory === "All" 
    ? offers 
    : offers.filter(o => o.foodItem?.category === selectedCategory);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Get quantity of specific offer in cart
  function getCartQuantity(offerId: string): number {
    const item = cart.items.find(item => item.offerId === offerId);
    return item ? item.quantity : 0;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Restaurant Hero */}
      <div className="relative h-64 bg-gradient-to-r from-green-600 to-green-800 overflow-hidden">
        {restaurant?.logoUrl && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${restaurant.logoUrl})`,
              backgroundSize: "1000px 1000px",
              backgroundPosition: `-${restaurant.cropX || 0}px -${restaurant.cropY || 0}px`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <button
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition"
              onClick={() => router.back()}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            {/* Reviews Button */}
            <button
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition"
              onClick={() => router.push(`/reviews/${id}`)}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reviews
            </button>
          </div>
          
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">{restaurant?.name || "Restaurant"}</h1>
            
            <div className="flex items-center gap-4 text-sm opacity-90 mb-3">
              <button
                className="flex items-center gap-1 hover:opacity-100 transition-opacity"
                onClick={() => router.push(`/reviews/${id}`)}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {restaurant?.averageRating?.toFixed(1) || "4.5"} ({restaurant?.totalReviews || 0} reviews)
              </button>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-green-400">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Pickup only
              </span>
            </div>
            
            {/* Address */}
            <div className="text-green-100 text-sm">
              📍 Str. Victoriei Nr. 15, București, România
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="sticky top-0 bg-white shadow-sm z-40 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pb-32">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg width="64" height="64" className="mx-auto" fill="none" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers available</h3>
            <p className="text-gray-600">Check back later for new deals!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOffers.map((offer) => {
              const cartQuantity = getCartQuantity(offer.id);
              const isOutOfStock = cartQuantity >= offer.quantity;
              
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <div className="flex gap-4">
                    {/* Food Image - Enhanced */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      {offer.foodItem?.imageUrl ? (
                        <Image
                          src={offer.foodItem.imageUrl}
                          alt={offer.food}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover rounded-xl shadow-sm"
                          priority={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-400 mx-auto mb-1">
                              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {offer.foodItem?.category && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                          {offer.foodItem.category}
                        </div>
                      )}
                      
                      {/* Quantity Badge */}
                      <div className="absolute -bottom-1 -left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                        {offer.quantity - cartQuantity} left
                      </div>
                      
                      {/* Cart Quantity Badge */}
                      {cartQuantity > 0 && (
                        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                          {cartQuantity} in cart
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 mr-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{offer.food}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {offer.foodItem?.description || `Fresh ${offer.food.toLowerCase()} available for pickup`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {offer.price.toFixed(2)} RON
                          </div>
                          <button
                            className={`px-6 py-2 rounded-full transition-colors font-medium text-sm shadow-sm ${
                              isOutOfStock 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                            onClick={() => !isOutOfStock && handleAddToCart(offer)}
                            disabled={isOutOfStock}
                          >
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                          </button>
                        </div>
                      </div>

                      {/* Food Info Tags */}
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        {offer.foodItem?.calories && (
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {offer.foodItem.calories} cal
                          </span>
                        )}
                        {offer.foodItem?.protein && (
                          <span className="bg-gray-50 px-2 py-1 rounded-full">
                            {offer.foodItem.protein}g protein
                          </span>
                        )}
                        <span className="bg-gray-50 px-2 py-1 rounded-full">
                          {new Date(offer.postedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Allergen Warnings */}
                      {offer.foodItem?.allergens && offer.foodItem.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {offer.foodItem.allergens.slice(0, 4).map((allergen) => (
                            <span
                              key={allergen}
                              className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium border border-red-100"
                            >
                              ⚠️ {allergen}
                            </span>
                          ))}
                          {offer.foodItem.allergens.length > 4 && (
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              +{offer.foodItem.allergens.length - 4} more allergens
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Floating Cart */}
      {cart.items.length > 0 && cart.restaurantId === id && (
        <div className="fixed bottom-6 left-6 right-6 bg-green-600 text-white rounded-2xl p-4 shadow-2xl z-50 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                {totalItems}
              </div>
              <div>
                <div className="font-semibold">View cart</div>
                <div className="text-green-100 text-sm">
                  {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} • {cart.restaurantName}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl">{totalPrice.toFixed(2)} RON</div>
              <button 
                className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors mt-1"
                onClick={() => router.push('/cart')}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modal for switching restaurant */}
      {showCartInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-orange-600">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Replace cart items?</h2>
              <p className="text-gray-600">
                Your cart contains items from <strong>{cart.restaurantName}</strong>. Do you want to replace them with items from <strong>{restaurant?.name}</strong>?
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
                Replace cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}