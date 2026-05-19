import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/vendor/DashboardPage'
import ProductsPage from './pages/vendor/ProductsPage'
import OrdersPage from './pages/vendor/OrdersPage'
import ProfilePage from './pages/vendor/ProfilePage'
import VendorLayout from './components/layout/VendorLayout'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/vendor/login" replace />
  return children
}

function GuestRoute({ children }) {
  const token = useAuthStore(s => s.token)
  if (token) return <Navigate to="/vendor/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/vendor/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/vendor/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />

      {/* Protected vendor dashboard */}
      <Route path="/vendor" element={<ProtectedRoute><VendorLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="orders"    element={<OrdersPage />} />
        <Route path="profile"   element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
