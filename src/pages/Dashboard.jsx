import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { db } from '../db/database.js'
import { formatPKR, formatDateTime, daysUntil, todayISO } from '../utils/format.js'
import { useApp } from '../context/AppContext.jsx'
import { ShoppingCart, TrendingUp, AlertTriangle, Clock, Plus, Package, ArrowUpRight, Sparkles, Activity } from 'lucide-react'

export default function Dashboard() {
  const { t } = useTranslation()
  const { admin, currentBranch } = useApp()

  const stats = useLiveQuery(async () => {
    const today = todayISO()
    const allSales = (await db.sales.toArray()).filter(s => s.branchId === currentBranch)
    const todaySales = allSales.filter(s => s.date?.slice(0, 10) === today && s.status !== 'void')
    const revenue = todaySales.reduce((a, s) => a + (s.total || 0), 0)

    const batches = (await db.batches.toArray()).filter(b => b.branchId === currentBranch)
    const meds = (await db.medicines.toArray()).filter(m => m.branchId === currentBranch)

    const medStock = {}
    batches.forEach(b => { medStock[b.medicineId] = (medStock[b.medicineId] || 0) + b.qty })
    const lowStock = meds.filter(m => (medStock[m.id] || 0) < 10)

    const nearExpiry = batches.filter(b => {
      const d = daysUntil(b.expiry)
      return d >= 0 && d <= 90 && b.qty > 0
    })

    const recent = [...allSales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

    return {
      saleCount: todaySales.length,
      revenue,
      lowStockCount: lowStock.length,
      nearExpiryCount: nearExpiry.length,
      recent,
      totalMeds: meds.length,
      totalRevenue: allSales.filter(s => s.status !== 'void').reduce((a, s) => a + s.total, 0)
    }
  }, [currentBranch], null)

  if (!stats) return null

  const cards = [
    { icon: ShoppingCart, label: t('dashboard.todaySales'), value: stats.saleCount, sub: 'Transactions today', gradient: 'from-blue-500 to-indigo-600', iconBg: 'from-blue-400 to-indigo-500' },
    { icon: TrendingUp, label: t('dashboard.todayRevenue'), value: formatPKR(stats.revenue), sub: "Today's earnings", gradient: 'from-emerald-500 to-teal-600', iconBg: 'from-emerald-400 to-teal-500' },
    { icon: AlertTriangle, label: t('dashboard.lowStock'), value: stats.lowStockCount, sub: 'Items need restock', gradient: 'from-amber-500 to-orange-600', iconBg: 'from-amber-400 to-orange-500' },
    { icon: Clock, label: t('dashboard.nearExpiry'), value: stats.nearExpiryCount, sub: 'Within 90 days', gradient: 'from-rose-500 to-pink-600', iconBg: 'from-rose-400 to-pink-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-brand-600 via-emerald-700 to-teal-800 text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"/>
        <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl"/>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest mb-2">
              <Sparkles size={14}/> Overview
            </div>
            <h1 className="text-4xl font-black leading-tight">
              Hello, {admin?.fullName?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="text-white/80 mt-2 max-w-lg">
              Your pharmacy earned <span className="font-black text-white">{formatPKR(stats.revenue)}</span> today across <span className="font-black text-white">{stats.saleCount}</span> sales. Keep going!
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/pos" className="btn bg-white text-brand-700 hover:bg-slate-50 shadow-xl">
              <Plus size={16}/> New Sale
            </Link>
            <Link to="/reports" className="btn bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25">
              <Activity size={16}/> Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <div key={i} className="stat-card group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <c.icon className="text-white" size={22} />
              </div>
              <ArrowUpRight className="text-slate-300 group-hover:text-brand-500 transition" size={18}/>
            </div>
            <div className="text-3xl font-black text-slate-800">{c.value}</div>
            <div className="text-sm font-bold text-slate-600 mt-1">{c.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{c.sub}</div>
            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${c.gradient}`}/>
          </div>
        ))}
      </div>

      {/* Recent + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-xl">{t('dashboard.recentSales')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest transactions</p>
            </div>
            <Link to="/sales" className="btn-ghost text-xs">View all →</Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-3">
                <Package size={28}/>
              </div>
              <div className="font-semibold">No sales yet</div>
              <div className="text-xs text-slate-400 mt-1">Start your first sale to see activity here</div>
              <Link to="/pos" className="btn-primary mt-4"><Plus size={16}/> Create Sale</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recent.map(s => (
                <div key={s.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-100 to-emerald-100 text-brand-700 flex items-center justify-center">
                      <Receipt size={18}/>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{s.invoiceNo}</div>
                      <div className="text-xs text-slate-500">{formatDateTime(s.date)} · {s.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="font-black text-brand-600 text-lg">{formatPKR(s.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-6 bg-gradient-to-br from-slate-900 via-emerald-900 to-brand-800 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-400/30 blur-3xl"/>
            <div className="relative">
              <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Total Revenue</div>
              <div className="text-4xl font-black mt-2">{formatPKR(stats.totalRevenue)}</div>
              <div className="text-xs text-white/60 mt-1">All-time earnings</div>
              <div className="mt-5 flex items-center gap-3 pt-5 border-t border-white/10">
                <div className="flex-1">
                  <div className="text-xs text-white/60">Medicines</div>
                  <div className="font-black text-lg">{stats.totalMeds}</div>
                </div>
                <div className="w-px h-10 bg-white/15"/>
                <div className="flex-1">
                  <div className="text-xs text-white/60">Alerts</div>
                  <div className="font-black text-lg">{stats.lowStockCount + stats.nearExpiryCount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-black text-base mb-3">{t('dashboard.quickActions')}</h3>
            <div className="space-y-2">
              <Link to="/pos" className="btn-primary w-full"><Plus size={16}/> {t('nav.pos')}</Link>
              <Link to="/inventory" className="btn-ghost w-full"><Package size={16}/> {t('nav.inventory')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Receipt(props) {
  return <ShoppingCart {...props}/>
}
