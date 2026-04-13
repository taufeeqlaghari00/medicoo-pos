import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../db/database.js'
import { useApp } from '../context/AppContext.jsx'
import { formatPKR, formatDateTime, todayISO } from '../utils/format.js'
import Receipt from '../components/billing/Receipt.jsx'
import { Printer, RotateCcw, X, Eye, Ban } from 'lucide-react'

export default function Sales() {
  const { t } = useTranslation()
  const { pharmacy } = useApp()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [viewSale, setViewSale] = useState(null)

  const sales = useLiveQuery(() => db.sales.toArray(), [], [])
  const medicines = useLiveQuery(() => db.medicines.toArray(), [], [])

  const filtered = useMemo(() => {
    return [...sales]
      .filter(s => {
        const d = s.date?.slice(0, 10)
        if (from && d < from) return false
        if (to && d > to) return false
        return true
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [sales, from, to])

  const openReceipt = async (sale) => {
    const items = await db.saleItems.where('saleId').equals(sale.id).toArray()
    setViewSale({ sale, items: items.map(it => ({ ...it, med: medicines.find(m => m.id === it.medicineId) })), pharmacy })
  }

  const voidSale = async (sale) => {
    const reason = prompt('Reason for void?')
    if (!reason) return
    await db.sales.update(sale.id, { status: 'void', voidReason: reason })
    const items = await db.saleItems.where('saleId').equals(sale.id).toArray()
    for (const it of items) {
      const b = await db.batches.where('medicineId').equals(it.medicineId).first()
      if (b) await db.batches.update(b.id, { qty: b.qty + it.qty })
    }
    await db.returns.add({ saleId: sale.id, date: new Date().toISOString(), reason, amount: sale.total, branchId: sale.branchId })
  }

  const totalRevenue = filtered.filter(s => s.status !== 'void').reduce((a, s) => a + s.total, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">{t('nav.sales')}</h2>
      </div>

      <div className="card p-5">
        <div className="flex items-end gap-3 flex-wrap mb-4">
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)}/>
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={to} onChange={e => setTo(e.target.value)}/>
          </div>
          <button onClick={() => { setFrom(todayISO()); setTo(todayISO()) }} className="btn-ghost">Today</button>
          <button onClick={() => { setFrom(''); setTo('') }} className="btn-ghost">All</button>
          <div className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <div className="text-xs opacity-80 font-semibold">TOTAL</div>
            <div className="font-extrabold text-lg">{formatPKR(totalRevenue)}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="p-3">Invoice</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center py-10 text-slate-400">No sales found</td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-3 font-semibold">{s.invoiceNo}</td>
                  <td className="p-3 text-slate-600">{formatDateTime(s.date)}</td>
                  <td className="p-3"><span className="chip bg-slate-100 text-slate-600">{s.paymentMethod}</span></td>
                  <td className="p-3">
                    <span className={`chip ${s.status === 'void' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {s.status || 'completed'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-brand-600">{formatPKR(s.total)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openReceipt(s)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Eye size={15}/></button>
                      {s.status !== 'void' && (
                        <button onClick={() => voidSale(s)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Ban size={15}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewSale && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Receipt</h3>
              <button onClick={() => setViewSale(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
            </div>
            <Receipt data={viewSale} />
            <button onClick={() => window.print()} className="btn-primary w-full mt-4"><Printer size={16}/> {t('common.print')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
