import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Building2, ChevronDown, Check, MapPin } from 'lucide-react'

export default function BranchSwitcher() {
  const { branches, currentBranch, changeBranch } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = branches.find(b => b.id === currentBranch) || branches[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pick = async (id) => {
    await changeBranch(id)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition font-bold text-xs ${
          open
            ? 'bg-white border-brand-300 shadow-soft'
            : 'bg-white/60 backdrop-blur border-slate-200/60 hover:bg-white hover:border-brand-200'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center text-white shrink-0">
          <Building2 size={13}/>
        </div>
        <div className="text-left max-w-[140px]">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Branch</div>
          <div className="text-slate-800 truncate mt-0.5">{current?.name}</div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`}/>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-4 bg-gradient-to-br from-brand-600 to-emerald-700 text-white">
            <div className="text-xs font-bold uppercase tracking-widest text-white/70">Switch Branch</div>
            <div className="font-black text-base mt-0.5">{branches.length} locations</div>
          </div>

          <div className="p-2 max-h-80 overflow-y-auto">
            {branches.map(b => {
              const active = b.id === currentBranch
              return (
                <button
                  key={b.id}
                  onClick={() => pick(b.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition text-left ${
                    active ? 'bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    active ? 'bg-gradient-to-br from-brand-500 to-emerald-700 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {b.code?.slice(0, 2) || 'BR'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-800 truncate">{b.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10}/> {b.address || b.code}
                    </div>
                  </div>
                  {active && (
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                      <Check size={13} className="text-white"/>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Active: <span className="text-brand-600">{current?.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
