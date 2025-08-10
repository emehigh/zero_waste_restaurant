"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

type RegisteredFood = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  protein: number;
  currentOffers: number;
};

type Offer = {
  id: string | number;
  food: string;
  quantity: number | string;
  unit: string;
  price: number | string;
  postedAt?: string;
  date?: string;
};

type OfferRequestBody = {
  quantity: number;
  unit: string;
  price: number;
  food?: string;
  foodItemId?: string;
};

const DashboardPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [price, setPrice] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  // New states for registered food
  const [registeredFoods, setRegisteredFoods] = useState<RegisteredFood[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/company-login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchOffers();
  }, []);

  // Fetch registered foods when modal opens
  useEffect(() => {
    if (showModal) {
      fetchRegisteredFoods();
    }
  }, [showModal, selectedCategory, searchTerm]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg">You must be logged in to view this page.</span>
      </div>
    );
  }

  // Fetch offers from backend
  async function fetchOffers() {
    try {
      const res = await fetch("/api/food-offer");
      if (!res.ok) throw new Error("Failed to fetch offers");
      const data = await res.json();
      console.log("Fetched offers:", data);
      setOffers(data.offers || []);
    } catch {
      setApiError("Could not load offers.");
    }
  }

  // Fetch registered foods
  async function fetchRegisteredFoods() {
    setLoadingFoods(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/restaurant-offers/registered-food?${params}`);
      if (!res.ok) throw new Error("Failed to fetch registered foods");
      
      const data = await res.json();
      setRegisteredFoods(data.foodItems || []);
      setCategories(data.categories || ["All"]);
    } catch (error) {
      console.error("Failed to fetch registered foods:", error);
    } finally {
      setLoadingFoods(false);
    }
  }

  async function handleAddOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setApiError("");
    
    try {
      const requestBody: OfferRequestBody = {
        quantity: parseInt(quantity),
        unit,
        price: parseFloat(price),
      };

      if (selectedFoodId) {
        // Using registered food item
        requestBody.foodItemId = selectedFoodId;
        const selectedFood = registeredFoods.find(f => f.id === selectedFoodId);
        requestBody.food = selectedFood?.name || "";
      } else {
        // Custom food item
        requestBody.food = foodName;
      }

      const res = await fetch("/api/food-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const data = await res.json();
        setApiError(data.error || "Failed to add offer.");
        setLoading(false);
        return;
      } 
      // Reset form and close modal
      await fetchOffers();
      setFoodName("");
      setQuantity("");
      setUnit("pcs");
      setPrice("");
      setSelectedFoodId("");
      setShowCustomFood(false);
      setShowModal(false);
    } catch {
      setApiError("Network error. Please try again.");
    }
    setLoading(false);
  }

  function resetModal() {
    setFoodName("");
    setQuantity("");
    setUnit("pcs");
    setPrice("");
    setSelectedFoodId("");
    setShowCustomFood(false);
    setSearchTerm("");
    setSelectedCategory("All");
    setApiError("");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}

      {/* Main content */}
      <main className="flex-1 p-2 sm:p-4 md:p-6">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-center text-gray-900 sm:text-left w-full sm:w-auto">
            {session?.user?.email
              ? `Welcome, ${session.user.email}!`
              : "Welcome!"}
          </h2>
          <button
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => {
              resetModal();
              setShowModal(true);
            }}
          >
            Add Food Offer
          </button>
        </header>

        {/* Enhanced Add Food Offer Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Add Food Offer</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Select from your registered foods or add a custom item</p>
              </div>

              <div className="flex h-[calc(90vh-200px)]">
                {/* Left Panel - Food Selection */}
                <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
                  {!showCustomFood ? (
                    <>
                      {/* Search and Filters */}
                      <div className="mb-6 space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Search foods..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => setShowCustomFood(true)}
                          >
                            Custom Item
                          </button>
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {categories.map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`px-3 py-1 rounded-full whitespace-nowrap text-sm ${
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

                      {/* Registered Foods List */}
                      <div className="space-y-3">
                        {loadingFoods ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                          </div>
                        ) : registeredFoods.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No registered foods found</p>
                            <button
                              className="text-green-600 hover:underline"
                              onClick={() => router.push('/register-food')}
                            >
                              Register your first food item →
                            </button>
                          </div>
                        ) : (
                          registeredFoods.map((food) => (
                            <div
                              key={food.id}
                              className={`border rounded-lg p-3 cursor-pointer transition ${
                                selectedFoodId === food.id
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setSelectedFoodId(food.id)}
                            >
                              <div className="flex gap-3">
                                {food.imageUrl ? (
                                  <Image
                                    src={food.imageUrl}
                                    alt={food.name}
                                    width={60}
                                    height={60}
                                    className="w-15 h-15 object-cover rounded-lg flex-shrink-0"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-15 h-15 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">No image</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-900">{food.name}</h4>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                      {food.category}
                                    </span>
                                  </div>
                                  {food.description && (
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{food.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>{food.calories} cal</span>
                                    <span>{food.protein}g protein</span>
                                    {food.currentOffers > 0 && (
                                      <span className="text-green-600 font-medium">
                                        {food.currentOffers} active offer{food.currentOffers !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                  {food.allergens.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {food.allergens.slice(0, 3).map((allergen) => (
                                        <span key={allergen} className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs">
                                          ⚠️ {allergen}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    /* Custom Food Input */
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Add Custom Food Item</h3>
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => setShowCustomFood(false)}
                        >
                          ← Back to registered foods
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Food Name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        required
                      />
                      <p className="text-gray-500 text-sm">
                        Consider <span className="text-green-600 font-medium cursor-pointer" onClick={() => router.push('/register-food')}>registering this food item</span> for future use with nutrition info and images.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Panel - Offer Details */}
                <div className="w-80 p-6 bg-gray-50">
                  <form onSubmit={handleAddOffer} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Offer Details</h3>
                    
                    {/* Selected Food Display */}
                    {selectedFoodId && !showCustomFood && (
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-500">Selected Food:</div>
                        <div className="font-semibold text-gray-900">
                          {registeredFoods.find(f => f.id === selectedFoodId)?.name}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        placeholder="e.g., 5"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min={1}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                      >
                        <option value="pcs">pieces</option>
                        <option value="kg">kg</option>
                        <option value="g">grams</option>
                        <option value="l">liters</option>
                        <option value="ml">ml</option>
                        <option value="portions">portions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (RON)</label>
                      <input
                        type="number"
                        placeholder="e.g., 15.99"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min={0}
                        step={0.01}
                      />
                    </div>

                    {apiError && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{apiError}</div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        disabled={loading || (!selectedFoodId && !foodName.trim())}
                      >
                        {loading ? "Adding..." : "Add Offer"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Offers Table - keep existing code */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Offers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-2 sm:px-4 border-b text-gray-900">Food</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-gray-900">Quantity</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-gray-900">Unit</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-gray-900">Price</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-gray-900">Posted</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-gray-900"></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer: Offer, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 sm:px-4 text-center text-gray-900 border-b">{offer.food}</td>
                    <td className="py-2 px-2 sm:px-4 text-center text-gray-900 border-b">{offer.quantity}</td>
                    <td className="py-2 px-2 sm:px-4 text-center text-gray-900 border-b">{offer.unit}</td>
                    <td className="py-2 px-2 sm:px-4 text-center text-gray-900 border-b">{offer.price}</td>
                    <td className="py-2 px-2 sm:px-4 text-center text-gray-900 border-b">
                      {offer.postedAt
                        ? new Date(offer.postedAt).toLocaleString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : offer.date || ""}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center border-b">
                      <button
                        className="text-red-600 font-bold text-lg hover:bg-red-100 rounded px-2"
                        onClick={() => setDeleteIdx(idx)}
                        title="Delete offer"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Keep existing delete modal code */}
        {typeof deleteIdx === "number" && offers[deleteIdx] && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm mx-2">
              <h2 className="text-lg font-bold mb-4 text-red-700">Delete Offer</h2>
              <p className="mb-6">
                Are you sure you want to delete <b>{offers[deleteIdx].food}</b>?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setDeleteIdx(null)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={async () => {
                    setLoading(true);
                    setApiError("");
                    try {
                      const res = await fetch("/api/food-offer", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: offers[deleteIdx].id }),
                      });
                      if (!res.ok) {
                        setApiError("Failed to delete offer.");
                      } else {
                        await fetchOffers();
                      }
                    } catch {
                      setApiError("Network error. Please try again.");
                    }
                    setLoading(false);
                    setDeleteIdx(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;