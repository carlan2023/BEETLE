import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const STATUS_BADGE = {
  PENDING:          <span className="badge-yellow">Pending</span>,
  ACCEPTED:         <span className="badge-green">Accepted</span>,
  REJECTED:         <span className="badge-red">Rejected</span>,
  READY_FOR_PICKUP: <span className="badge-orange">Ready</span>,
  IN_TRANSIT:       <span className="badge-orange">In Transit</span>,
  DELIVERED:        <span className="badge-green">Delivered</span>,
  CANCELLED:        <span className="badge-gray">Cancelled</span>,
}

export default function DashboardPage() {
  const { vendor } = useAuthStore()
  const [stats, setStats] = useState({ totalOrders: 0, todayOrders: 0, pendingOrders: 0, totalRevenue: 0 })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/orders/stats'),
          api.get('/orders?limit=5'),
        ])
        setStats(statsRes.data.data)
        setOrders(ordersRes.data.data)
      } catch {
        // stats stay at 0 — fine for pending accounts
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const STAT_CARDS = [
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Revenue (UGX)', value: `${(stats.totalRevenue / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-white">
          {greeting}, {vendor?.ownerName?.split(' ')[0]} 👋
        </h1>
        <p className="font-body text-white/40 mt-1">Here's what's happening with {vendor?.businessName} today.</p>
      </div>

      {/* Pending approval banner */}
      {vendor?.status === 'pending' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-heading font-bold text-yellow-400">Account Under Review</p>
            <p className="font-body text-yellow-400/70 text-sm mt-1">
              Your vendor account is being verified. You can set up your products now — orders will start
              once approved (usually within 24 hours).
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`card-dark border p-5 rounded-2xl ${s.bg}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className={`font-display text-4xl ${s.color}`}>
              {loading ? '—' : s.value}
            </div>
            <div className="font-body text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link to="/vendor/products"
          className="card-dark border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4
                     hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group">
          <div className="w-12 h-12 bg-orange-500/15 rounded-xl flex items-center justify-center text-2xl">📦</div>
          <div>
            <p className="font-heading font-bold text-white group-hover:text-orange-400 transition-colors">Manage Products</p>
            <p className="font-body text-white/40 text-sm">Add, edit, or remove your listings</p>
          </div>
          <span className="ml-auto text-white/20 group-hover:text-orange-400 transition-colors text-xl">→</span>
        </Link>
        <Link to="/vendor/orders"
          className="card-dark border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4
                     hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group">
          <div className="w-12 h-12 bg-orange-500/15 rounded-xl flex items-center justify-center text-2xl">🔔</div>
          <div>
            <p className="font-heading font-bold text-white group-hover:text-orange-400 transition-colors">View Orders</p>
            <p className="font-body text-white/40 text-sm">Process and update order status</p>
          </div>
          <span className="ml-auto text-white/20 group-hover:text-orange-400 transition-colors text-xl">→</span>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="card-dark border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-heading font-bold text-white">Recent Orders</h2>
          <Link to="/vendor/orders" className="text-orange-400 text-sm font-heading hover:text-orange-300 transition-colors">
            See all →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-white/20 font-body">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-heading text-white/40">No orders yet</p>
            <p className="font-body text-white/20 text-sm mt-1">Orders will appear here once customers start ordering</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {orders.map(order => (
              <div key={order._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-heading font-bold text-white text-sm">{order.orderNumber}</span>
                    {STATUS_BADGE[order.status]}
                  </div>
                  <p className="font-body text-white/40 text-xs truncate">
                    {order.customer.name} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading font-bold text-white text-sm">UGX {order.total.toLocaleString()}</p>
                  <p className="font-body text-white/30 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
