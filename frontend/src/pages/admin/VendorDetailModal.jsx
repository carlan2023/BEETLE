import {
  X,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Star,
  Calendar,
} from "lucide-react";

export default function VendorDetailModal({ vendor, onClose }) {
  if (!vendor) return null;

  const statusColor = {
    pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    approved: "bg-green-500/10 border-green-500/30 text-green-400",
    suspended: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-white/[0.1] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-white">
            Vendor Details
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl text-white mb-1">
                {vendor.businessName}
              </h1>
              <p className="text-white/60">{vendor.category}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-lg border font-semibold text-sm capitalize ${
                statusColor[vendor.status]
              }`}
            >
              {vendor.status}
            </span>
          </div>

          {/* Owner Info */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Owner Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60">Owner Name</span>
                <span className="text-white font-semibold">
                  {vendor.ownerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Email</span>
                <span className="text-white font-semibold break-all">
                  {vendor.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Phone</span>
                <span className="text-white font-semibold">{vendor.phone}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" />
              Location
            </h3>
            <div className="space-y-2">
              <p className="text-white">{vendor.address}</p>
              <p className="text-white/60 text-sm">
                City: {vendor.city || "Kampala"}
              </p>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">
              Business Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60">Description</span>
                <span className="text-white max-w-xs text-right">
                  {vendor.description || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Email Verified</span>
                <span
                  className={`text-sm font-semibold ${
                    vendor.isEmailVerified
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {vendor.isEmailVerified ? "✓ Verified" : "⊘ Not Verified"}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={18} className="text-green-400" />
                <span className="text-white/60 text-sm">Total Orders</span>
              </div>
              <p className="font-heading font-bold text-2xl text-white">
                {vendor.totalOrders}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-blue-400" />
                <span className="text-white/60 text-sm">Total Revenue</span>
              </div>
              <p className="font-heading font-bold text-2xl text-white">
                UGX {vendor.totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="text-purple-400" />
                <span className="text-white/60 text-sm">Rating</span>
              </div>
              <p className="font-heading font-bold text-2xl text-white">
                {vendor.rating.toFixed(1)}★
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-orange-400" />
                <span className="text-white/60 text-sm">Registered</span>
              </div>
              <p className="font-heading font-bold text-sm text-white">
                {new Date(vendor.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">
              Additional Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60">Reviews</span>
                <span className="text-white font-semibold">
                  {vendor.reviewCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Store Open</span>
                <span
                  className={`text-sm font-semibold ${
                    vendor.isOpen ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {vendor.isOpen ? "✓ Open" : "✕ Closed"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Active</span>
                <span
                  className={`text-sm font-semibold ${
                    vendor.isActive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {vendor.isActive ? "✓ Active" : "✕ Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.05] px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.08] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
