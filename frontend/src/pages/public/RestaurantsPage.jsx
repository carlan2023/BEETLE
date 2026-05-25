import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  BugIcon,
  FoodIcon,
  CartIcon,
  HomeIcon,
} from "../../components/icons/Icons";
import { getRestaurants } from "../../services/publicApi";

const FEATURES = [
  {
    icon: FoodIcon,
    title: "Local menus",
    description:
      "Browse top-rated restaurants and order cooked meals from trusted vendors across the city.",
  },
  {
    icon: CartIcon,
    title: "Fast checkout",
    description:
      "Save favorite dishes, use one-click reorder, and pay with cash or mobile money.",
  },
  {
    icon: HomeIcon,
    title: "Ready to deliver",
    description:
      "Get fresh, hot meals delivered straight to your door by reliable riders.",
  },
];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const result = await getRestaurants(page, 12);
        if (result.success) {
          setRestaurants(result.data);
          setTotalPages(result.pagination.pages);
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        toast.error("Failed to fetch restaurants");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center mb-16">
          <div>
            <span className="uppercase text-orange-500 text-sm font-semibold tracking-[0.32em]">
              Restaurants
            </span>
            <h1 className="font-display text-5xl md:text-6xl mt-6 mb-6">
              Fresh meals from favorite kitchens, delivered hot.
            </h1>
            <p className="font-body text-white/60 text-lg max-w-2xl leading-relaxed mb-10">
              Discover local restaurants, explore daily specials, and place
              orders with the confidence that your food arrives fast and fresh.
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
                Back to Home
              </Link>
              <Link
                to="/vendor/register"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white/90 hover:border-orange-400 hover:text-orange-300 transition"
              >
                Sell with Beetle
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_30px_120px_rgba(255,127,0,0.12)]">
            <img
              src="/assets/images/photo-output(1).png"
              alt="Restaurant delivery"
              className="w-full h-full min-h-[420px] object-cover"
            />
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="mt-24">
          <h2 className="font-display text-3xl text-white mb-8">
            Popular Restaurants
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="rounded-[2rem] border border-white/[0.08] overflow-hidden bg-white/[0.02] hover:border-orange-500/30 transition"
                  >
                    <div className="relative h-32 overflow-hidden">
                      {restaurant.coverUrl && (
                        <img
                          src={restaurant.coverUrl}
                          alt={restaurant.businessName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-white font-bold mb-1">
                        {restaurant.businessName}
                      </h3>
                      <p className="font-body text-white/50 text-sm mb-3 line-clamp-2">
                        {restaurant.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-400">
                          ⭐ {restaurant.rating || "N/A"}
                        </span>
                        <span className="text-white/40">
                          {restaurant.deliveryTimeMin}–
                          {restaurant.deliveryTimeMax} min
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
              <p className="text-white/50">No restaurants available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
