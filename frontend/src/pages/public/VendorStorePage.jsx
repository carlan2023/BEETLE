import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Phone, ShoppingCart, Store } from "lucide-react";
import toast from "react-hot-toast";
import { BoxIcon } from "../../components/icons/Icons";
import { getApiErrorMessage } from "../../services/api";
import { getVendorStore } from "../../services/publicApi";
import { useCustomerAuthStore } from "../../store/customerAuthStore";

const CATEGORY_LABELS = {
  groceries: "Groceries",
  food_drinks: "Food & Drinks",
  clothing: "Clothing",
  footwear: "Footwear",
  electronics: "Electronics",
  home_living: "Home & Living",
  pharmacy: "Pharmacy",
  other: "Other",
};

export default function VendorStorePage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { customer, cart, addToCart, loading: cartLoading } =
    useCustomerAuthStore();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const loadStore = async () => {
      try {
        setLoading(true);
        const result = await getVendorStore(vendorId);
        if (result.success) {
          setVendor(result.data.vendor);
          setProducts(result.data.products || []);
        } else {
          toast.error(result.message || "Failed to load vendor store.");
        }
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to load vendor store."));
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [vendorId]);

  const categories = useMemo(() => {
    const unique = new Set(
      products.map((product) => product.category).filter(Boolean),
    );
    return ["all", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesQuery =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, search]);

  const handleAddToCart = async (product) => {
    if (!customer) {
      navigate("/customer/login", {
        state: { from: `/shop/vendors/${vendorId}` },
      });
      return;
    }

    const result = await addToCart(product._id, vendorId, 1);
    if (result.success) {
      toast.success(result.message || "Added to cart.");
    } else {
      toast.error(result.message || "Failed to add to cart.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white px-6 py-20">
        <div className="max-w-4xl mx-auto text-center rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-12">
          <Store className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-3">
            Vendor store not found
          </h1>
          <p className="text-white/50 mb-6">
            This store may be unavailable or not yet approved for customer shopping.
          </p>
          <Link to="/browse-vendor" className="btn-primary inline-flex">
            Browse Vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <Link
              to="/browse-vendor"
              className="text-orange-500 hover:text-orange-400 text-sm mb-4 inline-block"
            >
              Back to vendors
            </Link>
            <h1 className="font-display text-4xl md:text-5xl mb-3">
              {vendor.businessName}
            </h1>
            <p className="text-white/55 max-w-2xl leading-relaxed mb-4">
              {vendor.description ||
                "Shop this vendor's available products and add them to your cart."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/55">
              {vendor.address && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-orange-400" />
                  {vendor.address}
                </span>
              )}
              {vendor.phone && (
                <span className="inline-flex items-center gap-2">
                  <Phone size={15} className="text-orange-400" />
                  {vendor.phone}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Store size={15} className="text-orange-400" />
                {CATEGORY_LABELS[vendor.category] || vendor.category}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className="btn-dark">
              All Products
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category
                      ? "border-orange-500 bg-orange-500/15 text-orange-300"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-orange-400/40 hover:text-white"
                  }`}
                >
                  {category === "all"
                    ? "All items"
                    : CATEGORY_LABELS[category] || category.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${vendor.businessName}...`}
              className="input-dark w-full lg:w-80"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-12 text-center">
            <BoxIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-2xl text-white mb-2">
              No products found
            </h2>
            <p className="text-white/50">
              Try another search or category in this store.
            </p>
          </div>
        ) : (
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
                      "Freshly listed by this Beetle vendor."}
                  </p>

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
        )}
      </div>
    </div>
  );
}
