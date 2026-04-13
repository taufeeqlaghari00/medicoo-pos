import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../db/database.js'
import { formatPKR, formatDate, daysUntil } from '../utils/format.js'
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react'

export default function Reports() {
  const { t } = useTranslation()

  const report = useLiveQuery(async () => {
    const sales = (await db.sales.toArray()).filter(s => s.status !== 'void')
    const items = await db.saleItems.toArray()
    const meds = await db.medicines.toArray()
    const batches = await db.batches.toArray()

    const totalRev = sales.reduce((a, s) => a + s.total, 0)
    const gstCollected = sales.reduce((a, s) => a + (s.gst || 0), 0)

    // Top selling
    const soldMap = {}
    items.forEach(it => {
      soldMap[it.medicineId] = (soldMap[it.medicineId] || 0) + it.qty
    })
    const top = Object.entries(soldMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, qty]) => ({ med: meds.find(m => m.id === Number(id)), qty }))

    // Profit
    let profit = 0
    items.forEach(it => {
      const med = meds.find(m => m.id === it.medicineId)
      if (med) profit += (med.salePrice - med.purchasePrice) * it.qty
    })

    // Expiry
    const expiring = batches
      .filter(b => b.qty > 0 && daysUntil(b.expiry) <= 90 && daysUntil(b.expiry) >= 0)
      .map(b => ({ ...b, med: meds.find(m => m.id === b.medicineId) }))
      .sort((a, z) => new Date(a.expiry) - new Date(z.expiry))

    return { totalRev, gstCollected, profit, top, expiring, saleCount: sales.length }
  }, [], null)

  if (!report) return null

  const cards = [
    { label: 'Total Revenue', value: formatPKR(report.totalRev), icon: TrendingUp, color: 'emerald' },
    { label: 'Estimated Profit', value: formatPKR(report.profit), icon: DollarSign, color: 'blue' },
    { label: 'GST Collected', value: formatPKR(report.gstCollected), icon: Package, color: 'violet' },
    { label: 'Total Sales', value: report.saleCount, icon: TrendingUp, color: 'amber' }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold">{t('nav.reports')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-500">{c.label}</div>
                <div className="text-2xl font-extrabold mt-2">{c.value}</div>
              </div>
              <c.icon className={`text-${c.color}-500`} size={22}/>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Top Selling Medicines</h3>
          {report.top.length === 0 ? (
            <p className="text-slate-400 text-sm">No sales yet</p>
          ) : (
            <div className="space-y-2">
              {report.top.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.med?.name}</div>
                    <div className="text-xs text-slate-500">{item.med?.generic}</div>
                  </div>
                  <div className="font-bold text-brand-600">{item.qty} sold</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={18}/> Expiry Report (90 days)
          </h3>
          {report.expiring.length === 0 ? (
            <p className="text-slate-400 text-sm">No items expiring soon ✓</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {report.expiring.map(b => {
                const days = daysUntil(b.expiry)
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                    <div>
                      <div className="font-semibold">{b.med?.name}</div>
                      <div className="text-xs text-slate-500">Batch: {b.batchNo} · Qty: {b.qty}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatDate(b.expiry)}</div>
                      <div className={`text-xs font-semibold ${days < 30 ? 'text-red-600' : 'text-amber-600'}`}>
                        {days} days
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
