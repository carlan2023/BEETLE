import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BugIcon,
  CartIcon,
  FoodIcon,
  ShoeIcon,
  ClothingIcon,
  PhoneIcon,
  HomeIcon,
  PharmacyIcon,
  BoxIcon,
  CheckIcon,
} from "../../components/icons/Icons";
import fallbackLogo from "../../assets/bug.svg";

const CATEGORIES = [
  { Icon: CartIcon, label: "Groceries" },
  { Icon: FoodIcon, label: "Food & Drinks" },
  { Icon: ShoeIcon, label: "Footwear" },
  { Icon: ClothingIcon, label: "Clothing" },
  { Icon: PhoneIcon, label: "Electronics" },
  { Icon: HomeIcon, label: "Home & Living" },
  { Icon: PharmacyIcon, label: "Pharmacy" },
  { Icon: BoxIcon, label: "Books" },
];

const STEPS = [
  {
    n: "01",
    title: "Browse",
    body: "Explore hundreds of products from verified local vendors across Kampala.",
  },
  {
    n: "02",
    title: "Order",
    body: "Add to cart and checkout in under a minute. Pay cash, MoMo, or card.",
  },
  {
    n: "03",
    title: "Track",
    body: "Watch your rider in real time. Average delivery is under 25 minutes.",
  },
];

const STATS = [
  { value: "40+", label: "Active Vendors" },
  { value: "25min", label: "Avg. Delivery" },
  { value: "5,000+", label: "Orders Delivered" },
  { value: "4.8★", label: "Customer Rating" },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    area: "Kololo",
    text: "Beetle saved me so much time. Groceries at my door in 20 minutes!",
    rating: 5,
  },
  {
    name: "Joseph K.",
    area: "Ntinda",
    text: "I ordered shoes from Sneaker Hub and they arrived same day. Incredible.",
    rating: 5,
  },
  {
    name: "Amara T.",
    area: "Nakasero",
    text: "Best delivery app in Kampala. The MoMo payment works flawlessly.",
    rating: 5,
  },
];

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/90 backdrop-blur-md border-b border-white/5" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg overflow-hidden">
            <img
              src="/assets/images/logo.PNG"
              alt="Beetle"
              className="w-9 h-9 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackLogo;
              }}
            />
          </div>
          <span className="font-display text-3xl text-white tracking-wider">
            BEETLE
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["How it works", "Categories", "For Vendors"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-white/60 hover:text-white font-body text-sm transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/login"
            className="text-white/70 hover:text-white font-heading text-sm font-semibold transition-colors hidden md:block"
          >
            Vendor Login
          </Link>
          <Link
            to="/vendor/register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold
                       text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Sell on Beetle
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Orange glow blobs */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/8 blur-[100px] pointer-events-none" />

      {/* Floating category pills (decorative) */}
      <div
        className="absolute top-32 right-20 hidden xl:flex flex-col gap-3 animate-fade-in"
        style={{ animationDelay: "0.8s", opacity: 0 }}
      >
        {[
          { Icon: CartIcon, label: "Groceries" },
          { Icon: ShoeIcon, label: "Shoes" },
          { Icon: PhoneIcon, label: "Electronics" },
        ].map((p, i) => (
          <div
            key={p.label}
            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/70 font-body"
            style={{ transform: `translateX(${i * 20}px)` }}
          >
            <div className="flex items-center gap-2">
              <p.Icon className="w-4 h-4" />
              <span>{p.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30
                          rounded-full px-4 py-2 text-orange-400 text-sm font-heading font-semibold mb-8 animate-fade-up"
          >
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse-dot" />
            Now delivering across Masaka
          </div>

          {/* Headline */}
          <h1
            className="font-display text-[80px] md:text-[110px] leading-[0.9] text-white mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            ORDER
            <br />
            <span className="text-orange-500">ANYTHING.</span>
            <br />
            GET IT FAST.
          </h1>

          <p
            className="font-body text-white/50 text-lg md:text-xl max-w-xl leading-relaxed mb-10 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Fast Food, Kitchen and groceries, clothings and foot wear; and
            electronics — from local vendors across Masaka, delivered to your
            door in under 30 minutes.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="#categories"
              className="bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold
                         text-lg px-8 py-4 rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              Start Ordering →
            </a>
            <Link
              to="/vendor/register"
              className="border-2 border-white/20 hover:border-orange-500 text-white font-heading font-bold
                         text-lg px-8 py-4 rounded-xl transition-all active:scale-95"
            >
              Become a Vendor
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap gap-8 mt-14 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl text-orange-500">
                  {s.value}
                </div>
                <div className="font-body text-white/40 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
        <span className="font-body text-xs tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-white/20" />
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section id="categories" className="py-24 bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="font-heading text-orange-500 text-sm font-semibold uppercase tracking-widest">
            What we deliver
          </span>
          <h2 className="font-display text-6xl md:text-7xl text-white mt-2">
            CATEGORIES
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((c, i) => (
            <div
              key={c.label}
              className="group bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06]
                         hover:border-orange-500/40 rounded-2xl p-6 cursor-pointer
                         transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="mb-3">
                <c.Icon className="w-8 h-8 text-orange-400" />
              </div>
              <div className="font-heading font-bold text-white group-hover:text-orange-400 transition-colors">
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-[#0A0A0A] relative overflow-hidden"
    >
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="mb-16">
          <span className="font-heading text-orange-500 text-sm font-semibold uppercase tracking-widest">
            Simple process
          </span>
          <h2 className="font-display text-6xl md:text-7xl text-white mt-2">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+16px)] w-8 border-t-2 border-dashed border-orange-500/30" />
              )}
              <div className="font-display text-8xl text-orange-500/15 leading-none mb-4">
                {s.n}
              </div>
              <h3 className="font-display text-4xl text-white mb-3">
                {s.title.toUpperCase()}
              </h3>
              <p className="font-body text-white/50 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VendorCTASection() {
  return (
    <section id="for-vendors" className="py-24 bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="relative bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent
                        border border-orange-500/20 rounded-3xl p-12 md:p-16 overflow-hidden"
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/5 rounded-full blur-[60px]" />

          <div className="relative max-w-2xl">
            <div
              className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30
                            rounded-full px-4 py-2 text-orange-400 text-sm font-heading font-semibold mb-6"
            >
              <BugIcon className="w-4 h-4" />
              For Businesses
            </div>
            <h2 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
              SELL MORE.
              <br />
              <span className="text-orange-500">REACH MORE.</span>
            </h2>
            <p className="font-body text-white/60 text-lg leading-relaxed mb-8">
              Register your business on Beetle and reach thousands of customers
              across Kampala. Manage orders, track sales, and grow your revenue
              — all from one dashboard.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Free to register — no upfront costs",
                "Manage products and orders in real time",
                "Get paid via MTN MoMo or Airtel Money",
                "Analytics and sales reports included",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-body text-white/70"
                >
                  <div
                    className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40
                                  flex items-center justify-center text-orange-400 text-xs shrink-0"
                  >
                    <CheckIcon className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/vendor/register"
                className="bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold
                           text-lg px-8 py-4 rounded-xl transition-all active:scale-95"
              >
                Register Your Business →
              </Link>
              <Link
                to="/vendor/login"
                className="border border-white/20 hover:border-white/40 text-white font-heading font-semibold
                           text-lg px-8 py-4 rounded-xl transition-all"
              >
                Vendor Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="font-heading text-orange-500 text-sm font-semibold uppercase tracking-widest">
            What people say
          </span>
          <h2 className="font-display text-6xl md:text-7xl text-white mt-2">
            REVIEWS
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <span key={j} className="text-orange-500 text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="font-body text-white/70 leading-relaxed mb-5">
                "{t.text}"
              </p>
              <div>
                <p className="font-heading font-bold text-white text-sm">
                  {t.name}
                </p>
                <p className="font-body text-white/40 text-xs">
                  {t.area}, Kampala
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/[0.06] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg">
                <BugIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-3xl text-white tracking-wider">
                BEETLE
              </span>
            </div>
            <p className="font-body text-white/40 text-sm leading-relaxed max-w-xs">
              Fast delivery across Kampala. From local vendors to your door in
              under 30 minutes.
            </p>
            <div className="flex gap-4 mt-5">
              {["Fb; BeetleUG", "Twitter; BeetleUG", "TikTok; Beetleapp"].map(
                (s) => (
                  <span
                    key={s}
                    className="font-body text-xs text-white/30 hover:text-orange-400 cursor-pointer transition-colors"
                  >
                    {s}
                  </span>
                ),
              )}
            </div>
          </div>
          <div>
            <p className="font-heading font-bold text-white text-sm mb-4 uppercase tracking-wide">
              Company
            </p>
            {["About", "Careers", "Press", "Contact"].map((l) => (
              <p
                key={l}
                className="font-body text-white/40 text-sm mb-2 hover:text-white cursor-pointer transition-colors"
              >
                {l}
              </p>
            ))}
          </div>
          <div>
            <p className="font-heading font-bold text-white text-sm mb-4 uppercase tracking-wide">
              Vendors
            </p>
            <Link
              to="/vendor/register"
              className="block font-body text-white/40 text-sm mb-2 hover:text-orange-400 cursor-pointer transition-colors"
            >
              Register
            </Link>
            <Link
              to="/vendor/login"
              className="block font-body text-white/40 text-sm mb-2 hover:text-orange-400 cursor-pointer transition-colors"
            >
              Login
            </Link>
            {["Help Center", "Pricing"].map((l) => (
              <p
                key={l}
                className="font-body text-white/40 text-sm mb-2 hover:text-white cursor-pointer transition-colors"
              >
                {l}
              </p>
            ))}
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-white/20 text-xs">
            © 2026 Beetle. All rights reserved. Kampala, Uganda.
          </p>
          <p className="font-body text-white/20 text-xs">
            +256 708 617 722 · www.beetleapp.com
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-[#0A0A0A]">
      <NavBar />
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <VendorCTASection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
