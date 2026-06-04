import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronRight, Check } from "lucide-react";
import { useCustomerAuthStore } from "../../store/customerAuthStore";
import toast from "react-hot-toast";
import { BugIcon } from "../../components/icons/Icons";

const STEPS = ["Personal Info", "Account Setup"];

const Field = ({
  label,
  field,
  value,
  error,
  onChange,
  type = "text",
  placeholder,
}) => (
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
);

export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading } = useCustomerAuthStore();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const redirectTo = location.state?.from || "/";

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: "" }));
  };

  const validateStep0 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Invalid email format";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) {
      setStep(1);
    }
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validateStep1()) return;

    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (result.success) {
      toast.success("Account created successfully!");
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#111] to-[#0A0A0A]
                      border-r border-white/[0.06] flex-col items-center justify-center p-16 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,107,0,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.8) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[80px]" />
        <div className="relative text-center">
          <div className="mb-6">
            <BugIcon className="w-20 h-20 text-white" />
          </div>
          <h2 className="font-display text-6xl text-white mb-3">BEETLE</h2>
          <p className="font-body text-white/40">Shop. Discover. Save.</p>
          <div className="mt-12 space-y-4 text-left max-w-xs">
            {[
              { Icon: Check, text: "Quick and easy registration" },
              { Icon: Check, text: "Secure shopping experience" },
              { Icon: Check, text: "Track your orders in real-time" },
              { Icon: Check, text: "Exclusive deals and offers" },
            ].map((i) => (
              <div
                key={i.text}
                className="flex items-center gap-3 text-white/50 font-body text-sm"
              >
                <i.Icon size={18} />
                {i.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <BugIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl text-white tracking-wider">
              BEETLE
            </span>
          </Link>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-orange-500" : "bg-white/[0.1]"
                    }`}
                  />
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < step ? "bg-orange-500" : "bg-white/[0.1]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-2">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>

          <h1 className="font-heading font-bold text-3xl text-white mb-1">
            {STEPS[step]}
          </h1>
          <p className="font-body text-white/40 text-sm mb-8">
            {step === 0 ? "Tell us about yourself" : "Create a secure account"}
          </p>

          <form onSubmit={submit}>
            {/* Step 0: Personal Info */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="First Name"
                    field="firstName"
                    value={form.firstName}
                    error={errors.firstName}
                    onChange={set}
                    placeholder="John"
                  />
                  <Field
                    label="Last Name"
                    field="lastName"
                    value={form.lastName}
                    error={errors.lastName}
                    onChange={set}
                    placeholder="Doe"
                  />
                </div>
                <Field
                  label="Email Address"
                  field="email"
                  value={form.email}
                  error={errors.email}
                  onChange={set}
                  type="email"
                  placeholder="you@example.com"
                />
                <Field
                  label="Phone Number"
                  field="phone"
                  value={form.phone}
                  error={errors.phone}
                  onChange={set}
                  placeholder="+256 700 000 000"
                />

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full btn-primary mt-8 flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-full btn-secondary mt-3"
                >
                  Back
                </button>
              </div>
            )}

            {/* Step 1: Account Setup */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••"
                      className={`input-dark pr-12 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Field
                  label="Confirm Password"
                  field="confirmPassword"
                  value={form.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={set}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary mt-8 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-full btn-secondary mt-3"
                >
                  Back
                </button>
              </div>
            )}
          </form>

          {step === 0 && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]">
              <p className="text-white/60 text-sm text-center">
                Already have an account?{" "}
                <Link
                  to="/customer/login"
                  state={{ from: redirectTo }}
                  className="text-orange-500 hover:text-orange-400 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
