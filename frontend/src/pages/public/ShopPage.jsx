import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart, Store, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../services/api";
import { getProducts } from "../../services/publicApi";
import { useCustomerAuthStore } from "../../store/customerAuthStore";
import {
  BoxIcon,
  CartIcon,
  ClothingIcon,
  FoodIcon,
  HomeIcon,
  PharmacyIcon,
  PhoneIcon,
  ShoeIcon,
} from "../../components/icons/Icons";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All", Icon: BoxIcon },
  { value: "groceries", label: "Groceries", Icon: CartIcon },
  { value: "food_drinks", label: "Food & Drinks", Icon: FoodIcon },
  { value: "clothing", label: "Clothing", Icon: ClothingIcon },
  { value: "footwear", label: "Footwear", Icon: ShoeIcon },
  { value: "electronics", label: "Electronics", Icon: PhoneIcon },
  { value: "home_living", label: "Home & Living", Icon: HomeIcon },
  { value: "pharmacy", label: "Pharmacy", Icon: PharmacyIcon },
  { value: "other", label: "Other", Icon: BoxIcon },
];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((category) => [category.value, category.label]),
);

export default function ShopPage() {
  const navigate = useNavigate();
  const { customer, cart, addToCart, loading: cartLoading } =
    useCustomerAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await getProducts(
          page,
          12,
          activeCategory === "all" ? null : activeCategory,
        );

        if (result.success) {
          setProducts(result.data || []);
          setTotalPages(result.pagination?.pages || 1);
        } else {
          toast.error(result.message || "Failed to load products.");
        }
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to load products."));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory, page]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const vendorName = product.vendorId?.businessName || "";
      return (
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        vendorName.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleAddToCart = async (product) => {
    if (!customer) {
      navigate("/customer/login", { state: { from: "/shop" } });
      return;
    }

    const vendorId =
      typeof product.vendorId === "string"
        ? product.vendorId
        : product.vendorId?._id;

    const result = await addToCart(product._id, vendorId, 1);
    if (result.success) {
      toast.success(result.message || "Added to cart.");
    } else {
      toast.error(result.message || "Failed to add to cart.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="uppercase text-orange-500 text-sm font-semibold tracking-[0.32em]">
              Customer storefront
            </span>
            <h1 className="font-display text-5xl md:text-6xl mt-5 mb-5">
              Shop products from Beetle vendors in one place.
            </h1>
            <p className="font-body text-white/60 text-lg leading-relaxed">
              According to the brief, customers are meant to shop from the
              customer-facing storefront. This page is that storefront: browse
              products, jump into vendor stores, add items to cart, and
              continue to checkout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/" className="btn-dark">
              Back Home
            </Link>
            <Link
              to="/browse-vendor"
              className="btn-dark inline-flex items-center gap-2"
            >
              Browse Vendors
              <ArrowRight size={16} />
            </Link>
            <Link to="/customer/orders" className="btn-dark">
              My Orders
            </Link>
            <Link
              to="/cart"
              className="btn-primary inline-flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              View Cart
              {customer && cart.length > 0 ? ` (${cart.length})` : ""}
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-6 mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === value
                      ? "border-orange-500 bg-orange-500/15 text-orange-300"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-orange-400/40 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or vendors..."
              className="input-dark w-full lg:w-80"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-12 text-center">
            <Tag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-2xl text-white mb-2">
              No products found
            </h2>
            <p className="text-white/50">
              Try another category or search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-[2rem] border border-white/[0.08] overflow-hidden bg-white/[0.02] hover:border-orange-500/30 transition"
                >
                  <div className="h-48 bg-white/[0.03] border-b border-white/[0.06] overflow-hidden">
                    {product.thumbnail || product.images?.[0] ? (
                      <img
                        src={product.thumbnail || product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BoxIcon className="w-14 h-14 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-heading font-bold text-white text-xl leading-tight">
                          {product.name}
                        </p>
                        <p className="text-white/40 text-sm mt-1">
                          {CATEGORY_LABELS[product.category] ||
                            product.category?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span className="font-display text-2xl text-orange-400 shrink-0">
                        UGX {product.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="font-body text-white/55 text-sm leading-relaxed mb-4 min-h-[40px]">
                      {product.description ||
                        "Freshly listed by a Beetle vendor."}
                    </p>

                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3 mb-4">
                      <p className="text-white/35 text-xs uppercase tracking-wide mb-1">
                        Vendor
                      </p>
                      <Link
                        to={
                          product.vendorId?._id
                            ? `/shop/vendors/${product.vendorId._id}`
                            : "/browse-vendor"
                        }
                        className="font-semibold text-white flex items-center gap-2 hover:text-orange-300 transition"
                      >
                        <Store size={15} className="text-orange-400" />
                        {product.vendorId?.businessName || "Beetle Vendor"}
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={cartLoading}
                      className="w-full btn-primary disabled:opacity-50"
                    >
                      {customer ? "Add to Cart" : "Login to Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 border border-white/20 rounded-lg text-white disabled:opacity-50 hover:border-orange-400 transition"
                >
                  Previous
                </button>
                <span className="flex items-center text-white/60">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page === totalPages}
                  className="px-6 py-2 border border-white/20 rounded-lg text-white disabled:opacity-50 hover:border-orange-400 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
