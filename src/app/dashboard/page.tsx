"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";


type Offer = {
  id: string | number;
  food: string;
  quantity: number | string;
  unit: string;
  price: number | string;
  postedAt?: string;
  date?: string;
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/company-login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchOffers();
  }, []);


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
    } catch (err) {
      setApiError("Could not load offers.");
    }
  }


  async function handleAddOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/food-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food: foodName,
          quantity,
          unit,
          price,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setApiError(data.error || "Failed to add offer.");
        setLoading(false);
        return;
      }
      // Fetch updated offers from backend
      await fetchOffers();
      setFoodName("");
      setQuantity("");
      setUnit("pcs");
      setPrice("");
      setShowModal(false);
    } catch (err) {
      setApiError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
  <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
    {/* Sidebar */}
  <aside className="md:w-64 bg-white shadow-md p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">EcoDashboard</h1>
          {/* Mobile: Dropdown toggle */}
          <button
            className="md:hidden text-green-700 border border-green-700 rounded px-3 py-1"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? "Close" : "Menu"}
          </button>
        </div>
        <nav
          className={`flex-col gap-4 items-center md:items-start md:flex ${
            sidebarOpen ? "flex" : "hidden"
          } md:mt-0 mt-2`}
        >
          <a href="#" className="text-green-700 font-semibold">
            Overview
          </a>
          <a href="#" className="text-gray-900">My Offers</a>
          <a href="#" className="text-gray-900">Analytics</a>
          <a href="#" className="text-gray-900">Settings</a>
          <button
            className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => signOut({ callbackUrl: "/company-login" })}
          >
            Logout
          </button>
        </nav>
      </aside>


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
          onClick={() => setShowModal(true)}
        >
          Add Food Offer
        </button>
      </header>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-4 sm:p-6 rounded shadow-lg w-full max-w-md mx-2">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add Food Offer</h2>
            <form className="flex flex-col gap-4" onSubmit={handleAddOffer}>
              <input
                type="text"
                placeholder="Food Name"
                className="border rounded px-3 py-2 text-gray-900"
                required
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                className="border rounded px-3 py-2 text-gray-900"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min={1}
              />
              <select
                className="border rounded px-3 py-2 text-gray-900"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                className="border rounded px-3 py-2 text-gray-900"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                min={0}
                step={0.01}
              />
              {apiError && <div className="text-red-600 text-sm">{apiError}</div>}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Offer"}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offers Table */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Offers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm">
            <thead>
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

      {/* Confirm Delete Modal */}
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
      {/* End Modal */}
    </main>
  </div>
);
};

export default DashboardPage;