import { useEffect, useState } from 'react'
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_META = {
  PENDING:          { label: 'Pending',         cls: 'badge-yellow', next: ['ACCEPTED','REJECTED'] },
  ACCEPTED:         { label: 'Accepted',         cls: 'badge-green',  next: ['READY_FOR_PICKUP','CANCELLED'] },
  REJECTED:         { label: 'Rejected',         cls: 'badge-red',    next: [] },
  READY_FOR_PICKUP: { label: 'Ready',            cls: 'badge-orange', next: [] },
  IN_TRANSIT:       { label: 'In Transit',       cls: 'badge-orange', next: ['DELIVERED'] },
  DELIVERED:        { label: 'Delivered',        cls: 'badge-green',  next: [] },
  CANCELLED:        { label: 'Cancelled',        cls: 'badge-gray',   next: [] },
}

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'REJECTED']

function OrderCard({ order, onUpdated }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const meta = STATUS_META[order.status] || { label: order.status, cls: 'badge-gray', next: [] }

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      await api.patch(`/orders/${order._id}/status`, { status })
      toast.success(`Order marked as ${status.replace(/_/g,' ')}`)
      onUpdated()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally { setUpdating(false) }
  }

  return (
    <div className="card-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(v => !v)}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-heading font-bold text-white text-sm">{order.orderNumber}</span>
            <span className={meta.cls}>{meta.label}</span>
            <span className="badge-gray">{order.paymentMethod.replace('_',' ')}</span>
          </div>
          <p className="font-body text-white/50 text-xs">
            {order.customer.name} · {order.customer.phone} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-heading font-bold text-orange-400 text-sm">UGX {order.total.toLocaleString()}</p>
          <p className="font-body text-white/25 text-xs">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-white/20 shrink-0">
          {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-4">
          {/* Customer */}
          <div className="bg-white/[0.02] rounded-xl p-3">
            <p className="font-heading text-white/40 text-xs uppercase tracking-wide mb-2">Customer</p>
            <p className="font-body text-white text-sm font-semibold">{order.customer.name}</p>
            <p className="font-body text-white/50 text-xs">{order.customer.phone}</p>
            <p className="font-body text-white/50 text-xs mt-0.5">📍 {order.customer.address}</p>
            {order.customer.notes && <p className="font-body text-yellow-400/70 text-xs mt-1">💬 {order.customer.notes}</p>}
          </div>

          {/* Items */}
          <div>
            <p className="font-heading text-white/40 text-xs uppercase tracking-wide mb-2">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-body text-white/70">{item.name} ×{item.quantity}</span>
                  <span className="font-body text-white/50">UGX {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-white/[0.06] pt-2 flex justify-between text-sm">
                <span className="font-heading font-bold text-white">Total</span>
                <span className="font-heading font-bold text-orange-400">UGX {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {meta.next.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {meta.next.map(s => (
                <button key={s} disabled={updating} onClick={() => updateStatus(s)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-heading font-bold transition-all active:scale-95',
                    s === 'REJECTED' || s === 'CANCELLED'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'
                      : 'bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25'
                  )}>
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const params = filter !== 'ALL' ? `?status=${filter}` : ''
      const res = await api.get(`/orders${params}`)
      setOrders(res.data.data)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [filter])

  // Auto-refresh every 30s for PENDING orders
  useEffect(() => {
    const t = setInterval(() => load(true), 30000)
    return () => clearInterval(t)
  }, [filter])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">Orders</h1>
          <p className="font-body text-white/40 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="btn-dark flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scroll pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-2 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all',
              filter === f ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
            )}>
            {f.replace(/_/g,' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/20 font-body">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-heading text-white/40">No {filter !== 'ALL' ? filter.replace(/_/g,' ').toLowerCase() : ''} orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order._id} order={order} onUpdated={() => load(true)} />
          ))}
        </div>
      )}
    </div>
  )
}
