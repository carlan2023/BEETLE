import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
} from "lucide-react";
import {
  BoxIcon,
  CartIcon,
  FoodIcon,
  ClothingIcon,
  ShoeIcon,
  PhoneIcon,
  HomeIcon,
  PharmacyIcon,
} from "../../components/icons/Icons";
import api from "../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "groceries",
  "food_drinks",
  "clothing",
  "footwear",
  "electronics",
  "home_living",
  "pharmacy",
  "other",
];
const ICONS = {
  groceries: CartIcon,
  food_drinks: FoodIcon,
  clothing: ClothingIcon,
  footwear: ShoeIcon,
  electronics: PhoneIcon,
  home_living: HomeIcon,
  pharmacy: PharmacyIcon,
  other: BoxIcon,
};
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
const EMPTY = {
  name: "",
  price: "",
  comparePrice: "",
  category: "",
  description: "",
  weight: "",
  stock: "",
  isAvailable: true,
};

function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState(
    product
      ? {
          ...product,
          price: product.price,
          comparePrice: product.comparePrice || "",
        }
      : EMPTY,
  );
  const [loading, setLoading] = useState(false);
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Name, price, and category are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock: Number(form.stock) || 0,
      };
      if (isEdit) await api.put(`/products/${product._id}`, payload);
      else await api.post("/products", payload);
      toast.success(isEdit ? "Product updated!" : "Product added!");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder, half }) => (
    <div className={half ? "" : "col-span-2"}>
      <label className="block font-heading text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        className="input-dark"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h2 className="font-heading font-bold text-xl text-white">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <Field
            label="Product Name *"
            field="name"
            placeholder="e.g. Ripe Avocados"
          />
          <div>
            <label className="block font-heading text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="input-dark"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c] || c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Price (UGX) *"
            field="price"
            type="number"
            placeholder="8000"
            half
          />
          <Field
            label="Compare Price"
            field="comparePrice"
            type="number"
            placeholder="Original price"
            half
          />
          <Field
            label="Weight / Unit"
            field="weight"
            placeholder="e.g. 1 kg, Pack of 3"
            half
          />
          <Field
            label="Stock Qty"
            field="stock"
            type="number"
            placeholder="0"
            half
          />
          <div className="col-span-2">
            <label className="block font-heading text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Brief product description..."
              className="input-dark resize-none"
            />
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("isAvailable", !form.isAvailable)}
              className={`w-10 h-6 rounded-full transition-all relative ${form.isAvailable ? "bg-orange-500" : "bg-white/10"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isAvailable ? "left-5" : "left-1"}`}
              />
            </button>
            <span className="font-body text-white/60 text-sm">
              Available for ordering
            </span>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/[0.06]">
          <button onClick={onClose} className="btn-dark flex-1">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | product object
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggle = async (id) => {
    try {
      await api.patch(`/products/${id}/toggle`);
      load();
    } catch {
      toast.error("Failed to toggle");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">
            Products
          </h1>
          <p className="font-body text-white/40 text-sm mt-1">
            {products.length} listing{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-dark pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/20 font-body">
          Loading products...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">
            <BoxIcon className="w-12 h-12 mx-auto text-white/20" />
          </div>
          <p className="font-heading text-white/40 text-lg">
            {search ? "No products found" : "No products yet"}
          </p>
          {!search && (
            <button
              onClick={() => setModal("new")}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add your first product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p._id}
              className={`card-dark border border-white/[0.06] rounded-2xl overflow-hidden transition-all ${!p.isAvailable ? "opacity-50" : ""}`}
            >
              <div className="h-28 bg-white/[0.03] flex items-center justify-center text-5xl border-b border-white/[0.04]">
                {(() => {
                  const I = ICONS[p.category] || BoxIcon;
                  return <I className="w-12 h-12" />;
                })()}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-heading font-bold text-white text-sm leading-tight">
                    {p.name}
                  </p>
                  {!p.isAvailable && (
                    <span className="badge-gray shrink-0">Off</span>
                  )}
                </div>
                {p.weight && (
                  <p className="font-body text-white/30 text-xs mb-2">
                    {p.weight}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display text-orange-400 text-xl">
                    UGX {p.price.toLocaleString()}
                  </span>
                  {p.comparePrice && (
                    <span className="font-body text-white/20 text-xs line-through">
                      UGX {p.comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(p._id)}
                    title="Toggle availability"
                    className="p-2 rounded-lg bg-white/5 hover:bg-orange-500/15 text-white/40 hover:text-orange-400 transition-all"
                  >
                    {p.isAvailable ? (
                      <ToggleRight size={16} />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => setModal(p)}
                    title="Edit"
                    className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => del(p._id)}
                    title="Delete"
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span className="ml-auto font-body text-white/20 text-xs">
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
