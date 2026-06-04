import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CartIcon, PharmacyIcon, BoxIcon } from "../../components/icons/Icons";
import { getGroceries } from "../../services/publicApi";
import { getApiErrorMessage } from "../../services/api";

const FEATURES = [
  {
    icon: CartIcon,
    title: "Daily essentials",
    description:
      "Order groceries, household supplies, and fresh produce from nearby vendors.",
  },
  {
    icon: PharmacyIcon,
    title: "Fast restock",
    description:
      "Get the items you need today with home delivery in under 30 minutes.",
  },
  {
    icon: BoxIcon,
    title: "Trusted vendors",
    description:
      "Shop from verified sellers with quality products and easy payments.",
  },
];

export default function GroceriesPage() {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        setLoading(true);
        const result = await getGroceries(page, 12);
        if (result.success) {
          setGroceries(result.data);
          setTotalPages(result.pagination.pages);
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        console.error("Failed to fetch grocery stores:", err);
        toast.error(
          getApiErrorMessage(err, "Failed to fetch grocery stores."),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroceries();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] items-center mb-16">
          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_30px_120px_rgba(255,127,0,0.12)]">
            <img
              src="/assets/images/photo-output.png"
              alt="Grocery delivery"
              className="w-full h-full min-h-[460px] object-cover"
            />
          </div>
          <div>
            <span className="uppercase text-orange-500 text-sm font-semibold tracking-[0.32em]">
              Groceries
            </span>
            <h1 className="font-display text-5xl md:text-6xl mt-6 mb-6">
              Shop local markets and get them delivered today.
            </h1>
            <p className="font-body text-white/60 text-lg max-w-2xl leading-relaxed mb-10">
              Fill your pantry with fresh produce, staples, and household goods
              from nearby vendors — all from one simple app.
            </p>
            <div className="grid gap-4 mb-10 sm:grid-cols-3">
              {FEATURES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/[0.08] p-6 bg-white/[0.02]"
                >
                  <item.icon className="w-8 h-8 text-orange-400 mb-4" />
                  <h2 className="font-heading text-white text-lg mb-2">
                    {item.title}
                  </h2>
                  <p className="font-body text-white/50 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white hover:bg-orange-600 transition"
              >
                Back to home
              </Link>
              <Link
                to="/vendor/register"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white/90 hover:border-orange-400 hover:text-orange-300 transition"
              >
                Become a vendor
              </Link>
            </div>
          </div>
        </div>

        {/* Groceries Grid */}
        <div className="mt-24">
          <h2 className="font-display text-3xl text-white mb-8">
            Popular Grocery Stores
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
            </div>
          ) : groceries.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groceries.map((store) => (
                  <div
                    key={store._id}
                    className="rounded-[2rem] border border-white/[0.08] overflow-hidden bg-white/[0.02] hover:border-orange-500/30 transition"
                  >
                    <div className="relative h-32 overflow-hidden">
                      {store.coverUrl && (
                        <img
                          src={store.coverUrl}
                          alt={store.businessName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-white font-bold mb-1">
                        {store.businessName}
                      </h3>
                      <p className="font-body text-white/50 text-sm mb-3 line-clamp-2">
                        {store.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-400">
                          ⭐ {store.rating || "N/A"}
                        </span>
                        <span className="text-white/40">
                          {store.deliveryTimeMin}–{store.deliveryTimeMax} min
                        </span>
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
              <p className="text-white/50">No grocery stores available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
