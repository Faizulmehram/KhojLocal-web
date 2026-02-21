import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingCart, MapPin, Clock, Package } from "lucide-react";
import Navbar from "../../components/Navbar";
import axios from "axios";

export default function OrderPlacement() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const vendor = state?.vendor || state?.business;

  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("Pickup");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Prepaid");
  const [loading, setLoading] = useState(false);

  // Mock menu items - in production, fetch from vendor
  const menuItems = vendor?.services?.map((service, idx) => ({
    id: `item_${idx}`,
    name: service,
    price: 10 + idx * 5,
    description: `Delicious ${service}`,
  })) || [
    { id: "1", name: "Item 1", price: 15.99, description: "Description 1" },
    { id: "2", name: "Item 2", price: 12.99, description: "Description 2" },
    { id: "3", name: "Item 3", price: 18.99, description: "Description 3" },
  ];

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    if (item.quantity > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    } else {
      setCart(cart.filter((cartItem) => cartItem.id !== itemId));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === "Delivery" ? 5.0 : 0;
  const platformFee = subtotal * 0.1;
  const tax = subtotal * 0.08;
  const totalAmount = subtotal + deliveryFee + platformFee + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Please add items to your cart");
      return;
    }

    if (orderType === "Delivery" && !deliveryAddress.street) {
      alert("Please provide delivery address");
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("Please login to place an order");
        navigate("/");
        return;
      }

      const user = JSON.parse(userStr);
      const token = user.token;

      const orderData = {
        vendorId: vendor?._id,
        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          description: item.description,
        })),
        orderType,
        deliveryAddress: orderType === "Delivery" ? deliveryAddress : undefined,
        specialInstructions,
        paymentMethod: paymentMethod === "Stripe" ? "Stripe" : paymentMethod,
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/user/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const orderId = response.data.order._id;

        // If Stripe payment, create checkout session
        if (paymentMethod === "Stripe") {
          const stripeResponse = await axios.post(
            "http://localhost:5000/api/stripe/create-checkout-session/order",
            { orderId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (stripeResponse.data.url) {
            // Redirect to Stripe checkout
            window.location.href = stripeResponse.data.url;
            return;
          }
        }

        // For Prepaid and Pay-On-Delivery
        alert("Order placed successfully! The vendor will be notified.");
        navigate("/my-orders");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-500">No vendor selected. Please go back and select a vendor.</p>
            <button
              onClick={() => navigate("/main")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Main Page
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Info */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{vendor.businessName || "Vendor"}</h1>
              <p className="text-gray-600">{vendor.category}</p>
              {vendor.address && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {vendor.address.street || ""}
                    {vendor.address.city && `, ${vendor.address.city}`}
                  </span>
                </div>
              )}
            </div>

            {/* Order Type Selection */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Order Type</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setOrderType("Pickup")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    orderType === "Pickup"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pickup
                </button>
                <button
                  onClick={() => setOrderType("Delivery")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    orderType === "Delivery"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            {orderType === "Delivery" && (
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={deliveryAddress.street}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={deliveryAddress.city}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={deliveryAddress.state}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, state: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={deliveryAddress.zipCode}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Menu Items</h2>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <p className="text-lg font-bold text-indigo-600 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Special Instructions</h2>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or instructions..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("Prepaid")}
                  className={`py-3 px-4 rounded-lg font-medium transition ${
                    paymentMethod === "Prepaid"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Prepaid
                </button>
                <button
                  onClick={() => setPaymentMethod("Pay-On-Delivery")}
                  className={`py-3 px-4 rounded-lg font-medium transition ${
                    paymentMethod === "Pay-On-Delivery"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pay on Delivery
                </button>
                <button
                  onClick={() => setPaymentMethod("Stripe")}
                  className={`py-3 px-4 rounded-lg font-medium transition ${
                    paymentMethod === "Stripe"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pay with Card
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Cart & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg sm:text-xl font-bold">Your Order</h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Platform Fee</span>
                      <span>${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || cart.length === 0}
                    className="w-full mt-6 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

