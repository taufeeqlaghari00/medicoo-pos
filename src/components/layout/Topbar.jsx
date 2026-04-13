import { useTranslation } from 'react-i18next'
import { Wifi, WifiOff, Globe, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatDate } from '../../utils/format.js'
import NotificationBell from './NotificationBell.jsx'
import BranchSwitcher from './BranchSwitcher.jsx'

export default function Topbar() {
  const { t } = useTranslation()
  const { online, lang, changeLang, pharmacy, admin, logout, branches, currentBranch } = useApp()
  const initials = (admin?.fullName || 'A').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()
  const current = branches.find(b => b.id === currentBranch)

  return (
    <header className="h-20 glass border-b border-white/60 flex items-center justify-between px-8 shrink-0 relative z-20">
      <div>
        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('common.welcome')}</div>
        <div className="font-black text-lg text-slate-800 mt-0.5">
          {admin?.fullName || pharmacy?.name}
          <span className="text-slate-300 font-normal mx-2">·</span>
          <span className="text-slate-500 font-semibold text-sm">{formatDate(new Date())}</span>
          {current && (
            <>
              <span className="text-slate-300 font-normal mx-2">·</span>
              <span className="text-brand-600 font-bold text-sm">📍 {current.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`chip px-3 py-2 ${online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}/>
          {online ? <Wifi size={12}/> : <WifiOff size={12}/>}
          {online ? t('common.online') : t('common.offline')}
        </div>

        <BranchSwitcher />

        <button
          onClick={() => changeLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-2 px-3 py-2.5 bg-white/60 backdrop-blur rounded-xl border border-slate-200/60 hover:bg-white transition font-bold text-xs"
        >
          <Globe size={14} />
          {lang === 'en' ? 'اردو' : 'English'}
        </button>

        <NotificationBell />

        <div className="w-px h-8 bg-slate-200"/>

        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <div className="font-black text-sm leading-tight">{admin?.fullName || 'Admin'}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{admin?.role}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-700 flex items-center justify-center text-white font-black shadow-lg shadow-brand-500/30">
            {initials}
          </div>
          <button onClick={logout} title="Sign out"
                  className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
            <LogOut size={16}/>
          </button>
        </div>
      </div>
    </header>
  )
}
