import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import LandingPage from "./pages/public/LandingPage";
import ShopPage from "./pages/public/ShopPage";
import VendorStorePage from "./pages/public/VendorStorePage";
import RestaurantsPage from "./pages/public/RestaurantsPage";
import GroceriesPage from "./pages/public/GroceriesPage";
import BecomeRiderPage from "./pages/public/BecomeRiderPage";
import CategoriesPage from "./pages/public/CategoriesPage";
import BrowseVendorPage from "./pages/public/BrowseVendorPage";
import CartPage from "./pages/public/CartPage";
import CustomerOrdersPage from "./pages/public/CustomerOrdersPage";
import CustomerLoginPage from "./pages/public/CustomerLoginPage";
import CustomerRegisterPage from "./pages/public/CustomerRegisterPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/vendor/DashboardPage";
import ProductsPage from "./pages/vendor/ProductsPage";
import OrdersPage from "./pages/vendor/OrdersPage";
import ProfilePage from "./pages/vendor/ProfilePage";
import VendorLayout from "./components/layout/VendorLayout";
import { useAuthStore } from "./store/authStore";
import { useCustomerAuthStore } from "./store/customerAuthStore";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function AdminProtected() {
  let raw = null;
  if (typeof window !== "undefined") {
    raw = localStorage.getItem("beetle-admin");
  }

  if (!raw) return <Navigate to="/admin/login" replace />;

  try {
    const data = JSON.parse(raw);
    if (!data?.token) return <Navigate to="/admin/login" replace />;
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/vendor/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/vendor/dashboard" replace />;
  return children;
}

function CustomerGuestRoute({ children }) {
  const token = useCustomerAuthStore((s) => s.token);
  if (token) return <Navigate to="/" replace />;
  return children;
}

function CustomerProtectedRoute({ children }) {
  const location = useLocation();
  const token = useCustomerAuthStore((s) => s.token);
  if (!token) {
    return (
      <Navigate
        to="/customer/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/vendors/:vendorId" element={<VendorStorePage />} />
      <Route path="/restaurants" element={<RestaurantsPage />} />
      <Route path="/groceries" element={<GroceriesPage />} />
      <Route path="/become-a-rider" element={<BecomeRiderPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/browse-vendor" element={<BrowseVendorPage />} />

      {/* Auth */}
      <Route
        path="/vendor/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/vendor/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      {/* Protected vendor dashboard */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/cart"
        element={
          <CustomerProtectedRoute>
            <CartPage />
          </CustomerProtectedRoute>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <CustomerProtectedRoute>
            <CustomerOrdersPage />
          </CustomerProtectedRoute>
        }
      />
      <Route
        path="/customer/register"
        element={
          <CustomerGuestRoute>
            <CustomerRegisterPage />
          </CustomerGuestRoute>
        }
      />
      <Route
        path="/customer/login"
        element={
          <CustomerGuestRoute>
            <CustomerLoginPage />
          </CustomerGuestRoute>
        }
      />

      {/* Admin */}
      <Route path="/admin">
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminProtected />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
