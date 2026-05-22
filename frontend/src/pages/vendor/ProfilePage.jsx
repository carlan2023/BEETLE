import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  CartIcon,
  FoodIcon,
  ClothingIcon,
  ShoeIcon,
  PhoneIcon,
  HomeIcon,
  PharmacyIcon,
  BoxIcon,
  HourglassIcon,
  CheckIcon,
  CrossIcon,
} from "../../components/icons/Icons";

const CATEGORIES = [
  { value: "groceries", label: "Groceries", Icon: CartIcon },
  { value: "food_drinks", label: "Food & Drinks", Icon: FoodIcon },
  { value: "clothing", label: "Clothing", Icon: ClothingIcon },
  { value: "footwear", label: "Footwear", Icon: ShoeIcon },
  { value: "electronics", label: "Electronics", Icon: PhoneIcon },
  { value: "home_living", label: "Home & Living", Icon: HomeIcon },
  { value: "pharmacy", label: "Pharmacy", Icon: PharmacyIcon },
  { value: "other", label: "Other", Icon: BoxIcon },
];

export default function ProfilePage() {
  const { vendor, refreshMe } = useAuthStore();
  const [form, setForm] = useState({
    businessName: vendor?.businessName || "",
    ownerName: vendor?.ownerName || "",
    phone: vendor?.phone || "",
    description: vendor?.description || "",
    address: vendor?.address || "",
    city: vendor?.city || "Kampala",
    category: vendor?.category || "",
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const setPw = (f, v) => setPwForm((p) => ({ ...p, [f]: v }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/vendor/profile", form);
      await refreshMe();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("Min 8 characters");
      return;
    }
    setSavingPw(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder, textarea }) => (
    <div>
      <label className="block font-heading text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={form[field]}
          onChange={(e) => set(field, e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="input-dark resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[field]}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder}
          className="input-dark"
        />
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl text-white">
          Store Profile
        </h1>
        <p className="font-body text-white/40 text-sm mt-1">
          Manage your business information
        </p>
      </div>

      {/* Account status */}
      <div
        className={`rounded-2xl p-4 border flex items-center gap-4 ${
          vendor?.status === "approved"
            ? "bg-emerald-500/10 border-emerald-500/20"
            : vendor?.status === "pending"
              ? "bg-yellow-500/10 border-yellow-500/20"
              : "bg-red-500/10 border-red-500/20"
        }`}
      >
        <span className="text-2xl">
          {vendor?.status === "approved" ? (
            <CheckIcon className="w-5 h-5" />
          ) : vendor?.status === "pending" ? (
            <HourglassIcon className="w-5 h-5" />
          ) : (
            <CrossIcon className="w-5 h-5" />
          )}
        </span>
        <div>
          <p className="font-heading font-bold text-white text-sm capitalize">
            Account: {vendor?.status}
          </p>
          <p className="font-body text-white/50 text-xs">{vendor?.email}</p>
        </div>
      </div>

      {/* Business info */}
      <div className="card-dark border border-white/[0.06] rounded-2xl p-6 space-y-5">
        <h2 className="font-heading font-bold text-white">
          Business Information
        </h2>
        <Field
          label="Business Name"
          field="businessName"
          placeholder="Your store name"
        />
        <Field
          label="Owner / Manager"
          field="ownerName"
          placeholder="Your name"
        />
        <div>
          <label className="block font-heading text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wide">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="input-dark"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <Field label="Phone" field="phone" placeholder="+256 7XX XXX XXX" />
        <Field label="Address" field="address" placeholder="Business address" />
        <Field label="City" field="city" placeholder="Kampala" />
        <Field
          label="Description"
          field="description"
          placeholder="Describe your business..."
          textarea
        />
        <button
          onClick={saveProfile}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Change password */}
      <div className="card-dark border border-white/[0.06] rounded-2xl p-6 space-y-5">
        <h2 className="font-heading font-bold text-white">Change Password</h2>
        {[
          { label: "Current Password", field: "currentPassword" },
          { label: "New Password", field: "newPassword" },
          { label: "Confirm New Password", field: "confirm" },
        ].map(({ label, field }) => (
          <div key={field}>
            <label className="block font-heading text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wide">
              {label}
            </label>
            <input
              type="password"
              value={pwForm[field]}
              onChange={(e) => setPw(field, e.target.value)}
              placeholder="••••••••"
              className="input-dark"
            />
          </div>
        ))}
        <button
          onClick={changePassword}
          disabled={savingPw}
          className="btn-outline w-full"
        >
          {savingPw ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}
