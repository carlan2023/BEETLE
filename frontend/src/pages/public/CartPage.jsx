import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCustomerAuthStore } from "../../store/customerAuthStore";
import toast from "react-hot-toast";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    customer,
    cart,
    cartTotal,
    loading,
    fetchCart,
    removeFromCart,
    updateCartItem,
    checkout,
  } = useCustomerAuthStore();

  const [address, setAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!customer) {
      navigate("/customer/login");
      return;
    }
    fetchCart();
  }, [customer, fetchCart, navigate]);

  const handleRemove = async (productId) => {
    const result = await removeFromCart(productId);
    if (result.success) {
      toast.success("Item removed from cart");
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const result = await updateCartItem(productId, newQuantity);
    if (!result.success) {
      toast.error(result.message);
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    setCheckoutLoading(true);
    const result = await checkout(address);
    setCheckoutLoading(false);

    if (result.success) {
      toast.success(
        `Order placed! Total: UGX ${result.totalAmount.toLocaleString()}`,
      );
      setAddress("");
      navigate("/customer/orders");
    } else {
      toast.error(result.message);
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/shop"
            className="text-orange-500 hover:text-orange-400 text-sm mb-4 inline-block"
          >
            ← Back to shopping
          </Link>
          <h1 className="font-heading font-bold text-4xl mb-2">
            Shopping Cart
          </h1>
          <p className="text-white/40">Review and manage your items</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-white/40 mb-6">
              Start adding items to get started
            </p>
            <Link to="/shop" className="btn-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 flex gap-4"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-white/[0.05] rounded flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-white/20" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.name}
                      </h3>
                      <p className="text-orange-500 font-semibold">
                        UGX {item.price.toLocaleString()}
                      </p>
                      <p className="text-white/40 text-sm mt-2">
                        Subtotal: UGX{" "}
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-red-400 hover:text-red-300 p-2"
                        disabled={loading}
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg p-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity - 1,
                            )
                          }
                          disabled={loading || item.quantity <= 1}
                          className="p-1 hover:bg-white/[0.1] rounded disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity + 1,
                            )
                          }
                          disabled={loading}
                          className="p-1 hover:bg-white/[0.1] rounded"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Section */}
            <div className="lg:col-span-1">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6 sticky top-8">
                <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

                {/* Totals */}
                <div className="space-y-3 mb-6 pb-6 border-b border-white/[0.05]">
                  <div className="flex justify-between text-white/60">
                    <span>Items ({cart.length})</span>
                    <span>UGX {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Delivery</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">
                      UGX {cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <label className="block text-white/70 text-sm mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-white placeholder-white/40 resize-none focus:outline-none focus:border-orange-500/50 transition-colors"
                    rows="3"
                  />
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !address.trim()}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
                </button>

                <p className="text-white/40 text-xs text-center mt-4">
                  By placing an order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
