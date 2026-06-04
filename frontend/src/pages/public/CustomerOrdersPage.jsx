import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Store, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api, { getApiErrorMessage } from "../../services/api";

const STATUS_STYLES = {
  PENDING: "badge-yellow",
  ACCEPTED: "badge-green",
  REJECTED: "badge-red",
  READY_FOR_PICKUP: "badge-orange",
  ASSIGNED: "badge-orange",
  PICKED_UP: "badge-orange",
  IN_TRANSIT: "badge-orange",
  DELIVERED: "badge-green",
  CANCELLED: "badge-gray",
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get("/customer/orders");
        setOrders(res.data.data || []);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to load your orders."));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/shop"
              className="text-orange-500 hover:text-orange-400 text-sm mb-4 inline-block"
            >
              Back to shopping
            </Link>
            <h1 className="font-heading font-bold text-4xl mb-2">My Orders</h1>
            <p className="text-white/40">Track your recent purchases</p>
          </div>
          <Link to="/cart" className="btn-primary">
            View Cart
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/20 font-body">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-12 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-white/40 mb-6">
              Once you complete checkout, your orders will appear here.
            </p>
            <Link to="/shop" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-heading font-bold text-white">
                        {order.orderNumber}
                      </span>
                      <span
                        className={
                          STATUS_STYLES[order.status] || "badge-gray"
                        }
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-orange-400 text-lg">
                      UGX {order.total.toLocaleString()}
                    </p>
                    <p className="text-white/40 text-sm">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-3">
                      Vendor
                    </p>
                    <p className="font-semibold flex items-center gap-2 mb-1">
                      <Store size={16} className="text-orange-400" />
                      {order.vendorId?.businessName || "Vendor"}
                    </p>
                    {order.vendorId?.phone && (
                      <p className="text-white/50 text-sm flex items-center gap-2">
                        <Phone size={14} />
                        {order.vendorId.phone}
                      </p>
                    )}
                    <p className="text-white/50 text-sm flex items-center gap-2 mt-2">
                      <MapPin size={14} />
                      {order.customer.address}
                    </p>
                  </div>

                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-3">
                      Items
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={`${order._id}-${index}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-white/70">
                            {item.name} x{item.quantity}
                          </span>
                          <span className="text-white/50">
                            UGX {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
