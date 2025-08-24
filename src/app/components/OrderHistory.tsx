"use client";

type Order = {
  id: string;
  restaurantName: string;
  items: string[];
  total: number;
  status: "completed" | "cancelled" | "pending";
  date: string;
  pickupTime: string;
};

type OrderHistoryProps = {
  orders: Order[];
};

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const statusColors = {
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800", 
    pending: "bg-yellow-100 text-yellow-800"
  };

  const statusIcons = {
    completed: "✓",
    cancelled: "✗",
    pending: "⏳"
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          {orders.length} orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-gray-400">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-4">Start ordering from local restaurants to see your history here.</p>
          <button
            onClick={() => window.location.href = "/offers"}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Browse Offers
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{order.restaurantName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {statusIcons[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{order.total.toFixed(2)} RON</div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex-1">
                  <div className="mb-1">
                    <strong>Items:</strong> {order.items.join(", ")}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Pickup: {order.pickupTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {new Date(order.date).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {order.status === "completed" && (
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 text-center">
          <button className="text-green-600 hover:text-green-700 font-medium">
            View All Orders →
          </button>
        </div>
      )}
    </div>
  );
}