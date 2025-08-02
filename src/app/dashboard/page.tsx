"use client";
import React, { useState, useEffect } from "react";

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
  const [price, setPrice] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
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

  useEffect(() => {
    fetchOffers();
  }, []);

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
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold mb-6">EcoDashboard</h1>
        <nav className="flex flex-col gap-4">
          <a href="#" className="text-green-700 font-semibold">Overview</a>
          <a href="#">My Offers</a>
          <a href="#">Analytics</a>
          <a href="#">Settings</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Welcome, Company Name!</h2>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setShowModal(true)}
          >
            Add Food Offer
          </button>
        </header>

          {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Food Offer</h2>
              <form className="flex flex-col gap-4" onSubmit={handleAddOffer}>
                <input
                  type="text"
                  placeholder="Food Name"
                  className="border rounded px-3 py-2"
                  required
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  className="border rounded px-3 py-2"
                  required
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  min={1}
                />
                <select
                  className="border rounded px-3 py-2"
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
                  className="border rounded px-3 py-2"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min={0}
                  step={0.01}
                />
                {apiError && <div className="text-red-600 text-sm">{apiError}</div>}
                <div className="flex gap-2 mt-2">
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
          <h3 className="text-lg font-semibold mb-4">Recent Offers</h3>
        <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Food</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Unit</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Posted</th>
                <th className="py-2 px-4 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer: any, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-4 text-center border-b">{offer.food}</td>
                  <td className="py-2 px-4 text-center border-b">{offer.quantity}</td>
                  <td className="py-2 px-4 text-center border-b">{offer.unit}</td>
                  <td className="py-2 px-4 text-center border-b">{offer.price}</td>
                  <td className="py-2 px-4 text-center border-b">
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
                  <td className="py-2 px-4 text-center border-b">
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
        </section>

        {/* Confirm Delete Modal - move this OUTSIDE the table */}
        {typeof deleteIdx === "number" && offers[deleteIdx] && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
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