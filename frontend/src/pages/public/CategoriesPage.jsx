import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CartIcon,
  FoodIcon,
  ShoeIcon,
  ClothingIcon,
  PhoneIcon,
  HomeIcon,
  PharmacyIcon,
  BoxIcon,
} from "../../components/icons/Icons";
import { getCategories } from "../../services/publicApi";

const ICON_MAP = {
  "Groceries": CartIcon,
  "Food & Drinks": FoodIcon,
  "Footwear": ShoeIcon,
  "Clothing": ClothingIcon,
  "Electronics": PhoneIcon,
  "Home & Living": HomeIcon,
  "Pharmacy": PharmacyIcon,
  "Books": BoxIcon,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success) {
          setCategories(result.data);
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        toast.error("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="uppercase text-orange-500 text-sm font-semibold tracking-[0.32em]">
            Explore
          </span>
          <h1 className="font-display text-5xl md:text-6xl mt-6">
            All product categories.
          </h1>
          <p className="font-body text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mt-6">
            From groceries and meals to electronics and fashion, Beetle brings the best local categories to your door.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = ICON_MAP[category.label] || CartIcon;
              return (
                <div
                  key={category.label}
                  className="rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-8 text-center transition hover:-translate-y-1 hover:border-orange-500/30"
                >
                  <Icon className="mx-auto mb-5 w-12 h-12 text-orange-400" />
                  <h2 className="font-heading text-xl text-white mb-2">
                    {category.label}
                  </h2>
                  <p className="font-body text-white/50 text-sm leading-relaxed">
                    {category.count > 0 ? `${category.count} vendors available` : "No vendors yet"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/50">No categories available.</p>
          </div>
        )}
        <div className="mt-16 flex flex-wrap gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white hover:bg-orange-600 transition"
          >
            Back to landing page
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
  );
}
