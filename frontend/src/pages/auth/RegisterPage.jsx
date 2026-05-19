import { memo, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "groceries", label: "🛒 Groceries" },
  { value: "food_drinks", label: "🍲 Food & Drinks" },
  { value: "clothing", label: "👗 Clothing" },
  { value: "footwear", label: "👟 Footwear" },
  { value: "electronics", label: "📱 Electronics" },
  { value: "home_living", label: "🏠 Home & Living" },
  { value: "pharmacy", label: "💊 Pharmacy" },
  { value: "other", label: "📦 Other" },
];

const STEPS = ["Business Info", "Contact & Location", "Account Setup"];

const Field = memo(
  ({ label, field, value, error, onChange, type = "text", placeholder }) => (
    <div>
      <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className={`input-dark ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  ),
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    description: "",
    ownerName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const set = useCallback((field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  }, []);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.businessName.trim()) e.businessName = "Required";
      if (!form.category) e.category = "Select a category";
    }
    if (step === 1) {
      if (!form.ownerName.trim()) e.ownerName = "Required";
      if (!form.phone.trim()) e.phone = "Required";
      if (!form.address.trim()) e.address = "Required";
    }
    if (step === 2) {
      if (!form.email.trim()) e.email = "Required";
      if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
      if (form.password.length < 8) e.password = "Min 8 characters";
      if (form.password !== form.confirmPassword)
        e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    if (!validateStep()) return;
    const result = await register({
      businessName: form.businessName,
      ownerName: form.ownerName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      category: form.category,
      address: form.address,
      description: form.description,
    });
    if (result.success) {
      toast.success("Welcome to Beetle! Your account is under review.");
      navigate("/vendor/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-orange-600 to-orange-900 items-center justify-center p-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative text-center">
          <div className="text-8xl mb-6">🪲</div>
          <h2 className="font-display text-6xl text-white mb-4">JOIN BEETLE</h2>
          <p className="font-body text-white/70 text-lg max-w-xs leading-relaxed">
            Register your business and start reaching thousands of customers
            across Kampala today.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              "Free to join",
              "MoMo payments",
              "Real-time orders",
              "Sales analytics",
            ].map((f) => (
              <div
                key={f}
                className="bg-white/10 rounded-xl p-3 text-sm font-heading text-white"
              >
                ✓ {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              🪲
            </div>
            <span className="font-display text-2xl text-white tracking-wider">
              BEETLE
            </span>
          </Link>

          <h1 className="font-heading font-bold text-2xl text-white mb-1">
            Create Vendor Account
          </h1>
          <p className="font-body text-white/40 text-sm mb-8">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-orange-500" : "bg-white/10"}`}
              />
            ))}
          </div>

          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <Field
                label="Business Name *"
                field="businessName"
                value={form.businessName}
                error={errors.businessName}
                placeholder="e.g. Fresh Mart Kololo"
                onChange={set}
              />
              <div>
                <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => set("category", c.value)}
                      className={`p-3 rounded-xl border text-sm font-heading text-left transition-all ${
                        form.category === c.value
                          ? "bg-orange-500/20 border-orange-500 text-orange-400"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-red-400 text-xs mt-1">{errors.category}</p>
                )}
              </div>
              <div>
                <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                  Description <span className="text-white/30">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  placeholder="Briefly describe your business..."
                  className="input-dark resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <Field
                label="Owner / Manager Name *"
                field="ownerName"
                value={form.ownerName}
                error={errors.ownerName}
                placeholder="Your full name"
                onChange={set}
              />
              <Field
                label="Phone Number *"
                field="phone"
                value={form.phone}
                error={errors.phone}
                placeholder="+256 7XX XXX XXX"
                onChange={set}
              />
              <Field
                label="Business Address *"
                field="address"
                value={form.address}
                error={errors.address}
                placeholder="e.g. Plot 12, Kololo Hill Road, Kampala"
                onChange={set}
              />
            </div>
          )}

          {/* Step 2: Account */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <Field
                label="Email Address *"
                field="email"
                value={form.email}
                error={errors.email}
                type="email"
                placeholder="you@business.com"
                onChange={set}
              />
              <Field
                label="Password *"
                field="password"
                value={form.password}
                error={errors.password}
                type="password"
                placeholder="Min 8 characters"
                onChange={set}
              />
              <Field
                label="Confirm Password *"
                field="confirmPassword"
                value={form.confirmPassword}
                error={errors.confirmPassword}
                type="password"
                placeholder="Repeat password"
                onChange={set}
              />
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm font-body text-orange-300/80">
                🪲 After registration, your account will be reviewed and
                activated within 24 hours.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={back} className="btn-dark flex-1">
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary flex-1">
                Continue →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? "Creating account..." : "Create Account 🪲"}
              </button>
            )}
          </div>

          <p className="text-center font-body text-white/30 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/vendor/login"
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
