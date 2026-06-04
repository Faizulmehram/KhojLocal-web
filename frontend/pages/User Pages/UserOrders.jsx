import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Search, Package, CheckCircle, XCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import API_BASE_URL from '../../config/api';

function StatusBadge({ status }) {
  const statusMap = {
    "Pending Payment": { bg: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    "Pending Vendor Confirmation": { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    "Confirmed": { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    "In Progress": { bg: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
    "Out for Delivery": { bg: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
    "Ready for Pickup": { bg: "bg-teal-50 text-teal-700", dot: "bg-teal-500" },
    "Completed": { bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
    "Cancelled": { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
    "Rejected": { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
  };
  const cfg = statusMap[status] || statusMap["Pending Payment"];
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium ${cfg.bg}`}>
      <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${cfg.dot}`} />
      {status}
    </div>
  );
}

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const canCancel = !["Completed", "Cancelled", "Rejected"].includes(order.status);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="hidden sm:flex items-center justify-center rounded-lg p-3 bg-indigo-50 text-2xl flex-shrink-0">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Order #{order._id?.slice(-8) || "N/A"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {order.vendor?.businessName || "Vendor"}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                {order.orderType && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{order.orderType}</span>
                  </div>
                )}
                {order.items && order.items.length > 0 && (
                  <div className="text-gray-600">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={order.status} />
            <p className="font-bold text-base sm:text-lg text-gray-900">
              ${order.totalAmount?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 sm:gap-3 justify-end">
          {canCancel && (
            <button
              onClick={() => onCancel(order._id)}
              className="rounded-lg h-9 sm:h-10 px-3 sm:px-4 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-200 transition"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg h-9 sm:h-10 w-9 sm:w-10 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            {expanded ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            {order.items && order.items.length > 0 && (
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.name || `Item ${idx + 1}`}</span>
                      <span className="font-medium">
                        ${item.price?.toFixed(2) || "0.00"} x {item.quantity || 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {order.deliveryAddress && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Delivery Address</h4>
                <p className="text-gray-600">
                  {order.deliveryAddress.street || ""}
                  {order.deliveryAddress.city && `, ${order.deliveryAddress.city}`}
                  {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
                </p>
              </div>
            )}
            {order.specialInstructions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Special Instructions</h4>
                <p className="text-gray-600">{order.specialInstructions}</p>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Payment Status</h4>
              <p className="text-gray-600">{order.paymentStatus || "Pending"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Payment Method</h4>
              <p className="text-gray-600">{order.paymentMethod || "N/A"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 mt-6 sm:mt-8">
      <div className="flex justify-center text-gray-300">
        <Package className="h-16 w-16 sm:h-20 sm:w-20" />
      </div>
      <h3 className="mt-4 text-lg sm:text-xl font-bold text-gray-900">No orders yet</h3>
      <p className="mt-2 text-sm sm:text-base text-gray-500">When you place an order, it will appear here.</p>
      <button
        onClick={() => window.location.href = "/main"}
        className="mt-6 rounded-lg h-10 sm:h-11 px-4 sm:px-6 bg-indigo-600 text-white text-sm sm:text-base font-semibold hover:bg-indigo-700 transition"
      >
        Browse Services
      </button>
    </div>
  );
}

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/user/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/auth/user/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.vendor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const upcomingOrders = filteredOrders.filter(
    (o) => !["Completed", "Cancelled", "Rejected"].includes(o.status)
  );
  const pastOrders = filteredOrders.filter((o) =>
    ["Completed", "Cancelled", "Rejected"].includes(o.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">My Orders</h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    className="w-full rounded-lg pl-10 sm:pl-11 pr-4 h-10 sm:h-11 border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Search by vendor, order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 h-10 sm:h-11 rounded-lg border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="Pending Payment">Pending Payment</option>
                <option value="Pending Vendor Confirmation">Pending Confirmation</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {orders.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {upcomingOrders.length > 0 && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold pb-3 sm:pb-4">Active Orders</h2>
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {upcomingOrders.map((order) => (
                      <OrderCard key={order._id} order={order} onCancel={handleCancelOrder} />
                    ))}
                  </div>
                </section>
              )}

              {pastOrders.length > 0 && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold pt-6 sm:pt-8 pb-3 sm:pb-4">Past Orders</h2>
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {pastOrders.map((order) => (
                      <OrderCard key={order._id} order={order} onCancel={handleCancelOrder} />
                    ))}
                  </div>
                </section>
              )}

              {filteredOrders.length === 0 && orders.length > 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <p className="text-gray-500">No orders match your search criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

