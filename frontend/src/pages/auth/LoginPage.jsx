import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/vendor/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#111] to-[#0A0A0A]
                      border-r border-white/[0.06] flex-col items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,107,0,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.8) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[80px]" />
        <div className="relative text-center">
          <div className="text-8xl mb-6">🪲</div>
          <h2 className="font-display text-6xl text-white mb-3">BEETLE</h2>
          <p className="font-body text-white/40">Vendor Dashboard</p>
          <div className="mt-12 space-y-4 text-left max-w-xs">
            {[
              { icon: '📦', text: 'Manage your product listings' },
              { icon: '🔔', text: 'Receive and process orders' },
              { icon: '📊', text: 'Track your sales and revenue' },
              { icon: '⚙️', text: 'Control your store settings' },
            ].map(i => (
              <div key={i.text} className="flex items-center gap-3 text-white/50 font-body text-sm">
                <span className="text-xl">{i.icon}</span>
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
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">🪲</div>
            <span className="font-display text-2xl text-white tracking-wider">BEETLE</span>
          </Link>

          <h1 className="font-heading font-bold text-3xl text-white mb-1">Vendor Login</h1>
          <p className="font-body text-white/40 text-sm mb-8">Sign in to your vendor dashboard</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block font-heading font-semibold text-white/70 text-sm mb-2">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@business.com" autoComplete="email"
                className={`input-dark ${errors.email ? 'border-red-500' : ''}`} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-heading font-semibold text-white/70 text-sm mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Your password" autoComplete="current-password"
                  className={`input-dark pr-12 ${errors.password ? 'border-red-500' : ''}`} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4 mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center font-body text-white/30 text-sm mt-6">
            No account yet?{' '}
            <Link to="/vendor/register" className="text-orange-400 hover:text-orange-300 transition-colors">
              Register your business
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
