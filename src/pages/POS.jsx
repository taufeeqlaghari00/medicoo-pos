import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, nextInvoiceNo, getSetting } from '../db/database.js'
import { formatPKR } from '../utils/format.js'
import { useApp } from '../context/AppContext.jsx'
import { Search, Plus, Minus, Trash2, Printer, X, Banknote, Smartphone, CreditCard, Wallet } from 'lucide-react'
import Receipt from '../components/billing/Receipt.jsx'

const PAYMENTS = [
  { key: 'Cash', icon: Banknote },
  { key: 'JazzCash', icon: Smartphone },
  { key: 'Easypaisa', icon: Smartphone },
  { key: 'Bank', icon: CreditCard },
  { key: 'Credit', icon: Wallet }
]

export default function POS() {
  const { t } = useTranslation()
  const { currentBranch, pharmacy } = useApp()
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [customerId, setCustomerId] = useState(1)
  const [discountPct, setDiscountPct] = useState(0)
  const [payment, setPayment] = useState('Cash')
  const [received, setReceived] = useState(0)
  const [lastSale, setLastSale] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [gstRate, setGstRate] = useState(18)

  useEffect(() => {
    getSetting('tax').then(tx => setGstRate(tx?.gstRate ?? 18))
  }, [])

  const medicines = useLiveQuery(
    () => db.medicines.filter(m => m.branchId === currentBranch).toArray(),
    [currentBranch], []
  )
  const customers = useLiveQuery(() => db.customers.toArray(), [], [])
  const batches = useLiveQuery(
    () => db.batches.filter(b => b.branchId === currentBranch).toArray(),
    [currentBranch], []
  )

  const stockMap = useMemo(() => {
    const m = {}
    batches.forEach(b => { m[b.medicineId] = (m[b.medicineId] || 0) + b.qty })
    return m
  }, [batches])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return medicines
      .filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.generic?.toLowerCase().includes(q) ||
        m.barcode?.includes(query)
      )
      .slice(0, 8)
  }, [query, medicines])

  const addToCart = (med) => {
    const stock = stockMap[med.id] || 0
    if (stock <= 0) { alert('Out of stock'); return }
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id)
      if (existing) {
        if (existing.qty >= stock) { alert('No more stock'); return prev }
        return prev.map(i => i.id === med.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...med, qty: 1, itemDiscount: 0 }]
    })
    setQuery('')
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i
      const stock = stockMap[id] || 0
      const next = Math.max(1, Math.min(stock, i.qty + delta))
      return { ...i, qty: next }
    }))
  }

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const clearCart = () => { setCart([]); setDiscountPct(0); setReceived(0) }

  const subtotal = cart.reduce((a, i) => a + i.salePrice * i.qty, 0)
  const gstAmount = cart.reduce((a, i) => {
    if (i.gstExempt) return a
    return a + (i.salePrice * i.qty * gstRate / 100)
  }, 0)
  const discountAmount = subtotal * (discountPct / 100)
  const total = Math.max(0, subtotal + gstAmount - discountAmount)
  const change = Math.max(0, Number(received || 0) - total)

  const completeSale = async () => {
    if (cart.length === 0) return
    const invoiceNo = nextInvoiceNo()
    const date = new Date().toISOString()
    const saleId = await db.sales.add({
      invoiceNo, date, customerId, total, subtotal, gst: gstAmount,
      discount: discountAmount, status: 'completed', branchId: currentBranch,
      paymentMethod: payment, received: Number(received || total),
      syncStatus: 'pending'
    })

    for (const item of cart) {
      await db.saleItems.add({
        saleId, medicineId: item.id, qty: item.qty,
        price: item.salePrice, discount: 0, gst: item.gstExempt ? 0 : gstRate
      })
      // Reduce stock from earliest batch
      const medBatches = await db.batches.where('medicineId').equals(item.id).toArray()
      let remaining = item.qty
      for (const b of medBatches.sort((a, z) => new Date(a.expiry) - new Date(z.expiry))) {
        if (remaining <= 0) break
        const take = Math.min(b.qty, remaining)
        await db.batches.update(b.id, { qty: b.qty - take })
        remaining -= take
      }
    }

    if (payment === 'Credit') {
      const c = await db.customers.get(customerId)
      await db.customers.update(customerId, { credit: (c.credit || 0) + total })
    }

    const sale = await db.sales.get(saleId)
    const items = await db.saleItems.where('saleId').equals(saleId).toArray()
    setLastSale({ sale, items: items.map(it => ({ ...it, med: cart.find(c => c.id === it.medicineId) })), pharmacy })
    setShowReceipt(true)
    clearCart()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      {/* Left: search + results */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        <div className="card p-5">
          <div className="relative">
            <Search className="absolute top-3.5 left-4 text-slate-400" size={18} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('pos.searchMedicine')}
              className="input pl-11 text-base"
            />
          </div>
          {results.length > 0 && (
            <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {results.map(m => (
                <button
                  key={m.id}
                  onClick={() => addToCart(m)}
                  className="w-full flex items-center justify-between p-3 hover:bg-brand-50 transition text-left"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.generic} · {m.brand} · Stock: {stockMap[m.id] || 0}</div>
                  </div>
                  <div className="font-bold text-brand-600">{formatPKR(m.salePrice)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{t('pos.cart')} ({cart.length})</h3>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-sm text-red-500 font-semibold hover:underline">
                {t('pos.clear')}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto -mx-2">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('pos.cartEmpty')}
              </div>
            ) : (
              <div className="space-y-2 px-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{item.name}</div>
                      <div className="text-xs text-slate-500">{formatPKR(item.salePrice)} each</div>
                    </div>
                    <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200">
                      <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:text-brand-600"><Minus size={14}/></button>
                      <span className="w-8 text-center font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:text-brand-600"><Plus size={14}/></button>
                    </div>
                    <div className="w-24 text-right font-bold text-brand-700">{formatPKR(item.salePrice * item.qty)}</div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: checkout */}
      <div className="lg:col-span-2 card p-6 flex flex-col">
        <h3 className="font-bold text-lg mb-4">Checkout</h3>

        <label className="label">{t('pos.customer')}</label>
        <select className="input mb-4" value={customerId} onChange={e => setCustomerId(Number(e.target.value))}>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
        </select>

        <label className="label">{t('common.discount')} (%)</label>
        <input type="number" min="0" max="100" className="input mb-4"
               value={discountPct} onChange={e => setDiscountPct(Number(e.target.value) || 0)} />

        <label className="label">{t('pos.payment')}</label>
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {PAYMENTS.map(p => {
            const Icon = p.icon
            const active = payment === p.key
            return (
              <button key={p.key} onClick={() => setPayment(p.key)}
                className={`p-2 rounded-xl border-2 transition text-[10px] font-bold flex flex-col items-center gap-1 ${active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                <Icon size={16}/>
                {p.key}
              </button>
            )
          })}
        </div>

        <label className="label">{t('pos.received')}</label>
        <input type="number" className="input mb-4"
               value={received} onChange={e => setReceived(e.target.value)} placeholder="0"/>

        <div className="mt-auto space-y-1.5 pt-4 border-t border-slate-100">
          <Row label={t('common.subtotal')} value={formatPKR(subtotal)} />
          <Row label={`${t('common.gst')} (${gstRate}%)`} value={formatPKR(gstAmount)} />
          <Row label={`${t('common.discount')} (${discountPct}%)`} value={`- ${formatPKR(discountAmount)}`} />
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-600">{t('common.total')}</span>
            <span className="text-2xl font-extrabold text-brand-600">{formatPKR(total)}</span>
          </div>
          {received > 0 && <Row label={t('pos.change')} value={formatPKR(change)} highlight />}

          <button onClick={completeSale} disabled={cart.length === 0} className="btn-primary w-full mt-4 text-base py-3">
            <Printer size={18}/> {t('pos.completeSale')}
          </button>
        </div>
      </div>

      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Sale Complete ✓</h3>
              <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
            </div>
            <Receipt data={lastSale} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => window.print()} className="btn-primary flex-1"><Printer size={16}/> {t('common.print')}</button>
              <button onClick={() => setShowReceipt(false)} className="btn-ghost flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</span>
    </div>
  )
}
