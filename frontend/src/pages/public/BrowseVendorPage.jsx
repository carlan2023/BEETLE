import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CheckIcon,
} from "../../components/icons/Icons";
import { browseVendors } from "../../services/publicApi";

const BENEFITS = [
  "Create your shop in minutes",
  "List products, prices, and promos instantly",
  "Track orders and sales from one dashboard",
  "Receive payments via MTN MoMo and Airtel Money",
];

export default function BrowseVendorPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const result = await browseVendors(page, 12);
        if (result.success) {
          setVendors(result.data);
          setTotalPages(result.pagination.pages);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Failed to fetch vendors");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.95fr] items-center">
          <div>
            <span className="uppercase text-orange-500 text-sm font-semibold tracking-[0.32em]">
              Vendor support
            </span>
            <h1 className="font-display text-5xl md:text-6xl mt-6 mb-6">
              Browse as a vendor and grow your business on Beetle.
            </h1>
            <p className="font-body text-white/60 text-lg max-w-2xl leading-relaxed mb-10">
              List your store, manage orders, and access customers across
              Kampala from a single vendor dashboard.
            </p>
            <div className="space-y-4 mb-10">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-3xl border border-white/[0.08] p-5 bg-white/[0.02]"
                >
                  <div className="mt-1 shrink-0 rounded-full border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                  <p className="font-body text-white/70 leading-relaxed">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/vendor/register"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white hover:bg-orange-600 transition"
              >
                Register your store
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white/90 hover:border-orange-400 hover:text-orange-300 transition"
              >
                Back to home
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_30px_120px_rgba(255,127,0,0.12)]">
            <img
              src="/assets/images/photo-output(2).png"
              alt="Vendor dashboard"
              className="w-full h-full min-h-[460px] object-cover"
            />
          </div>
        </div>
        {/* Vendors Grid */}
        <div className="mt-24">
          <h2 className="font-display text-3xl text-white mb-8">Browse Vendors</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
            </div>
          ) : vendors.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {vendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    className="rounded-[2rem] border border-white/[0.08] overflow-hidden bg-white/[0.02] hover:border-orange-500/30 transition"
                  >
                    <div className="relative h-32 overflow-hidden">
                      {vendor.coverUrl && (
                        <img
                          src={vendor.coverUrl}
                          alt={vendor.businessName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-white font-bold mb-1">{vendor.businessName}</h3>
                      <p className="font-body text-white/50 text-sm mb-3 line-clamp-2">{vendor.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-400">⭐ {vendor.rating || "N/A"}</span>
                        <span className="text-white/40">{vendor.deliveryTimeMin}–{vendor.deliveryTimeMax} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-2 border border-white/20 rounded-lg text-white disabled:opacity-50 hover:border-orange-400 transition"
                  >
                    Previous
                  </button>
                  <span className="flex items-center text-white/60">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-6 py-2 border border-white/20 rounded-lg text-white disabled:opacity-50 hover:border-orange-400 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/50">No vendors available yet.</p>
            </div>
          )}
        </div>      </div>
    </div>
  );
}
