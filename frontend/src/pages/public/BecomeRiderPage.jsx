import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { HomeIcon, PhoneIcon, CheckIcon } from "../../components/icons/Icons";
import { signupAsRider } from "../../services/publicApi";

const STEPS = [
  {
    title: "Sign up quickly",
    description:
      "Create your rider profile and share your availability in minutes.",
  },
  {
    title: "Accept orders",
    description:
      "Receive delivery requests from nearby vendors and start earning immediately.",
  },
  {
    title: "Earn on every trip",
    description:
      "Get paid fast for each completed delivery with flexible payout options.",
  },
];

export default function BecomeRiderPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.city.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const result = await signupAsRider(formData);
      if (result.success) {
        setSubmitted(true);
        toast.success(result.message);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          city: "",
          experience: "",
        });
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to submit rider application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div>
            <span className="uppercase text-orange-500 text-sm font-semibold tracking-[0.32em]">
              Ride with Beetle
            </span>
            <h1 className="font-display text-5xl md:text-6xl mt-6 mb-6">
              Become a rider and start delivering in your neighborhood.
            </h1>
            <p className="font-body text-white/60 text-lg max-w-2xl leading-relaxed mb-10">
              Join our fleet of riders, enjoy flexible hours, and earn more by
              delivering food, groceries, and essentials across Masaka.
            </p>
            <div className="space-y-4 mb-10">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-white/[0.08] p-6 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 mb-3 text-orange-400 font-semibold">
                    <span className="rounded-full bg-orange-500/15 w-10 h-10 grid place-items-center text-lg">
                      {index + 1}
                    </span>
                    {step.title}
                  </div>
                  <p className="font-body text-white/50 leading-relaxed">
                    {step.description}
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
                Register as a vendor
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.02] p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="mb-4 text-5xl">✅</div>
                <h3 className="font-heading text-2xl text-white mb-3">
                  Application Received!
                </h3>
                <p className="font-body text-white/60 mb-6">
                  Thanks for your interest! Our team will contact you soon with
                  next steps.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-white hover:bg-orange-600 transition"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-heading text-2xl text-white mb-6">
                  Sign Up as a Rider
                </h3>
                <div>
                  <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+256 7XX XXX XXX"
                    className="w-full input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    className="w-full input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold text-white/70 text-sm mb-2">
                    Delivery Experience (Optional)
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Tell us about your experience"
                    className="w-full input-dark"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 mt-6"
                >
                  {loading ? "Submitting..." : "Apply Now →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
