import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { BugIcon, HourglassIcon } from "../../components/icons/Icons";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import clsx from "clsx";

const NAV = [
  { to: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/vendor/products", icon: Package, label: "Products" },
  { to: "/vendor/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/vendor/profile", icon: User, label: "Profile" },
];

export default function VendorLayout() {
  const { vendor, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
  };

  const statusColors = {
    approved: "badge-green",
    pending: "badge-yellow",
    suspended: "badge-red",
  };

  const Sidebar = ({ mobile = false }) => (
    <div
      className={clsx(
        "flex flex-col h-full bg-[#0D0D0D] border-r border-white/[0.06]",
        mobile ? "w-72" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-base">
          <BugIcon className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl text-white tracking-wider">
          BEETLE
        </span>
        {mobile && (
          <button
            onClick={() => setOpen(false)}
            className="ml-auto text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Vendor info */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30
                          flex items-center justify-center font-heading font-bold text-orange-400 text-lg"
          >
            {vendor?.businessName?.[0]?.toUpperCase() || "V"}
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-white text-sm truncate">
              {vendor?.businessName}
            </p>
            <span className={statusColors[vendor?.status] || "badge-gray"}>
              {vendor?.status || "pending"}
            </span>
          </div>
        </div>
        {vendor?.status === "pending" && (
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 text-xs font-body text-yellow-400/80 flex items-start gap-2">
            <HourglassIcon className="w-4 h-4 mt-1" />
            <div>Account under review. We'll email you within 24hrs.</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-semibold text-sm transition-all",
                isActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5",
              )
            }
            onClick={() => mobile && setOpen(false)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40
                     hover:text-red-400 hover:bg-red-500/10 transition-all w-full
                     font-heading font-semibold text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0D0D0D] border-b border-white/[0.06]">
          <button
            onClick={() => setOpen(true)}
            className="text-white/60 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <span className="font-display text-xl text-white tracking-wider">
            BEETLE
          </span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
