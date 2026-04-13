import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, ShoppingCart, Package, Receipt,
  Users, Truck, BarChart3, Settings, Pill, Sparkles, UserCog, Lock
} from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const items = [
  { to: '/', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/pos', icon: ShoppingCart, key: 'pos' },
  { to: '/inventory', icon: Package, key: 'inventory' },
  { to: '/sales', icon: Receipt, key: 'sales' },
  { to: '/customers', icon: Users, key: 'customers' },
  { to: '/employees', icon: UserCog, key: 'employees', locked: true },
  { to: '/suppliers', icon: Truck, key: 'suppliers' },
  { to: '/reports', icon: BarChart3, key: 'reports' },
  { to: '/settings', icon: Settings, key: 'settings' }
]

export default function Sidebar() {
  const { t } = useTranslation()
  const { admin } = useApp()
  const initials = (admin?.fullName || 'A').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()

  return (
    <aside className="w-72 shrink-0 glass border-r border-white/60 flex flex-col relative z-20">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-white/40">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Pill className="text-white" size={24} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
            <Sparkles size={8} className="text-white"/>
          </div>
        </div>
        <div>
          <div className="font-black text-xl leading-tight bg-gradient-to-r from-brand-700 to-emerald-600 bg-clip-text text-transparent">
            {t('app.name')}
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pharmacy POS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Main Menu</div>
        {items.map(({ to, icon: Icon, key, locked }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all relative overflow-hidden ${
                isActive
                  ? 'text-white shadow-lg shadow-brand-500/25 bg-gradient-to-r from-brand-500 via-brand-600 to-emerald-600'
                  : 'text-slate-600 hover:bg-white/80 hover:shadow-sm'
              }`
            }
          >
            <Icon size={19} className="transition group-hover:text-brand-600" />
            <span>{t(`nav.${key}`)}</span>
            {locked && <Lock size={12} className="ml-auto opacity-60"/>}
          </NavLink>
        ))}
      </nav>

      {/* Admin card */}
      <div className="p-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-900 to-brand-800 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand-400/30 blur-2xl"/>
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center font-black text-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{admin?.fullName || 'Admin'}</div>
              <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">{admin?.role || 'Super Admin'}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
