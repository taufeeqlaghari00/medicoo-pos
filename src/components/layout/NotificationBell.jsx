import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database.js'
import { daysUntil, formatDateTime, formatPKR } from '../../utils/format.js'
import { Link } from 'react-router-dom'
import { Bell, AlertTriangle, Clock, Package, CheckCircle2, X, ArrowRight } from 'lucide-react'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const data = useLiveQuery(async () => {
    const meds = await db.medicines.toArray()
    const batches = await db.batches.toArray()
    const sales = await db.sales.orderBy('id').reverse().limit(5).toArray()

    const stock = {}
    batches.forEach(b => { stock[b.medicineId] = (stock[b.medicineId] || 0) + b.qty })

    const lowStock = meds.filter(m => (stock[m.id] || 0) < 10).slice(0, 5)
    const expiring = batches
      .filter(b => b.qty > 0 && daysUntil(b.expiry) >= 0 && daysUntil(b.expiry) <= 90)
      .map(b => ({ ...b, med: meds.find(m => m.id === b.medicineId) }))
      .sort((a, z) => daysUntil(a.expiry) - daysUntil(z.expiry))
      .slice(0, 5)
    const recentSales = sales.filter(s => s.status !== 'void').slice(0, 3)

    return { lowStock, expiring, recentSales }
  }, [], null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!data) return null
  const total = data.lowStock.length + data.expiring.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 bg-white/60 backdrop-blur rounded-xl border border-slate-200/60 hover:bg-white transition"
      >
        <Bell size={16} className="text-slate-600"/>
        {total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="p-5 bg-gradient-to-br from-brand-600 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"/>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/70">Alerts</div>
                <div className="font-black text-xl">Notifications</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
                <Bell size={18}/>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/80">
              {total > 0 ? `${total} item${total > 1 ? 's' : ''} need your attention` : 'All caught up! 🎉'}
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {total === 0 && data.recentSales.length === 0 && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 mb-2">
                  <CheckCircle2 size={26}/>
                </div>
                <div className="font-bold text-slate-700">You're all set!</div>
                <div className="text-xs text-slate-500 mt-1">No alerts right now</div>
              </div>
            )}

            {data.lowStock.length > 0 && (
              <Section title="Low Stock" count={data.lowStock.length} color="amber">
                {data.lowStock.map(m => (
                  <Item
                    key={m.id}
                    icon={<AlertTriangle size={15} className="text-amber-600"/>}
                    bg="bg-amber-50"
                    title={m.name}
                    sub={`${m.generic || ''} — restock needed`}
                    tag="Low"
                    tagColor="bg-amber-100 text-amber-700"
                  />
                ))}
              </Section>
            )}

            {data.expiring.length > 0 && (
              <Section title="Expiring Soon" count={data.expiring.length} color="rose">
                {data.expiring.map(b => {
                  const days = daysUntil(b.expiry)
                  return (
                    <Item
                      key={b.id}
                      icon={<Clock size={15} className="text-rose-600"/>}
                      bg="bg-rose-50"
                      title={b.med?.name || 'Medicine'}
                      sub={`Batch ${b.batchNo} · ${b.qty} units`}
                      tag={`${days}d left`}
                      tagColor={days < 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                    />
                  )
                })}
              </Section>
            )}

            {data.recentSales.length > 0 && (
              <Section title="Recent Sales" count={data.recentSales.length} color="emerald">
                {data.recentSales.map(s => (
                  <Item
                    key={s.id}
                    icon={<Package size={15} className="text-emerald-600"/>}
                    bg="bg-emerald-50"
                    title={s.invoiceNo}
                    sub={formatDateTime(s.date)}
                    tag={formatPKR(s.total)}
                    tagColor="bg-emerald-100 text-emerald-700"
                  />
                ))}
              </Section>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <Link to="/reports" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-brand-600 hover:bg-brand-50 transition">
              View all reports <ArrowRight size={14}/>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, count, color, children }) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="px-5 py-2.5 flex items-center justify-between bg-slate-50/70">
        <div className="text-xs font-black text-slate-600 uppercase tracking-widest">{title}</div>
        <span className={`chip bg-${color}-100 text-${color}-700`}>{count}</span>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  )
}

function Item({ icon, bg, title, sub, tag, tagColor }) {
  return (
    <div className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition cursor-pointer">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-slate-800 truncate">{title}</div>
        <div className="text-xs text-slate-500 truncate">{sub}</div>
      </div>
      <span className={`chip ${tagColor}`}>{tag}</span>
    </div>
  )
}
