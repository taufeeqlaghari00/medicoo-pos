import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getSetting } from '../db/database.js'
import { useApp } from '../context/AppContext.jsx'
import { Pill, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useApp()
  const [u, setU] = useState('admin')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { getSetting('admin').then(setAdmin) }, [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const a = await getSetting('admin')
    if (u === a.username && p === a.password) {
      login(a)
    } else {
      setErr('Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full bg-blobs bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4 relative">
      {/* Animated blobs already via bg-blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none"/>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/20 animate-slide-up">
        {/* Left side - branding */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 via-brand-700 to-emerald-900 text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl"/>
          <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-teal-400/20 blur-3xl"/>

          <div className="relative">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
                <Pill size={26} className="text-white"/>
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight">Medicoo</div>
                <div className="text-xs text-white/70 font-medium">Pharmacy POS · Pakistan</div>
              </div>
            </div>

            <h1 className="text-4xl font-black leading-tight mb-4">
              Welcome back to<br/>your pharmacy.
            </h1>
            <p className="text-white/80 leading-relaxed max-w-sm">
              Complete offline-first POS for modern Pakistani pharmacies — billing, inventory, udhaar, reports & DRAP-ready.
            </p>
          </div>

          <div className="relative space-y-3">
            <Feature icon="💊" text="10+ medicines pre-loaded · 80mm thermal receipts" />
            <Feature icon="🌐" text="Works 100% offline · English & اردو" />
            <Feature icon="🏢" text="Multi-branch · GST-compliant · Udhaar tracking" />
          </div>
        </div>

        {/* Right side - form */}
        <div className="bg-white/95 backdrop-blur-2xl p-8 md:p-12 flex flex-col justify-center relative">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Pill className="text-white"/>
            </div>
            <div className="text-xl font-black">Medicoo</div>
          </div>

          <h2 className="text-3xl font-black text-slate-800">Sign in</h2>
          <p className="text-slate-500 mt-1 mb-8">Enter your credentials to access the POS</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User size={18} className="absolute top-3 left-3.5 text-slate-400"/>
                <input
                  value={u}
                  onChange={e => setU(e.target.value)}
                  className="input pl-11"
                  placeholder="admin"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute top-3 left-3.5 text-slate-400"/>
                <input
                  type={show ? 'text' : 'password'}
                  value={p}
                  onChange={e => setP(e.target.value)}
                  className="input pl-11 pr-11"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)}
                        className="absolute top-3 right-3.5 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {err && (
              <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold animate-fade-in">
                {err}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-brand-600"/>
            </div>
            <div className="text-xs text-slate-600">
              Trouble signing in? Contact your pharmacy administrator or reset credentials from the admin panel.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-500 font-medium">
        © 2026 Medicoo · v1.0 · Made for Pakistani pharmacies 🇵🇰
      </div>
    </div>
  )
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/90 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{text}</span>
    </div>
  )
}
