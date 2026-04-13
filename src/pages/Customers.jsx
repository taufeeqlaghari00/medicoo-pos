import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../db/database.js'
import { formatPKR } from '../utils/format.js'
import { Plus, Edit2, Trash2, X, Wallet, Users as UsersIcon } from 'lucide-react'

export default function Customers() {
  const { t } = useTranslation()
  const [form, setForm] = useState(null)
  const [payFor, setPayFor] = useState(null)
  const [payAmt, setPayAmt] = useState(0)

  const customers = useLiveQuery(() => db.customers.toArray(), [], [])
  const totalCredit = customers.reduce((a, c) => a + (c.credit || 0), 0)

  const save = async () => {
    if (!form.name) return
    if (form.id) await db.customers.update(form.id, { name: form.name, phone: form.phone, address: form.address })
    else await db.customers.add({ name: form.name, phone: form.phone || '', address: form.address || '', credit: 0, branchId: 1 })
    setForm(null)
  }

  const del = async (id) => {
    if (id === 1) return alert("Can't delete walk-in customer")
    if (confirm('Delete?')) await db.customers.delete(id)
  }

  const collectPayment = async () => {
    const amt = Number(payAmt)
    if (!amt || amt <= 0) return
    const c = await db.customers.get(payFor.id)
    await db.customers.update(payFor.id, { credit: Math.max(0, (c.credit || 0) - amt) })
    await db.payments.add({ customerId: payFor.id, amount: amt, date: new Date().toISOString(), note: 'Udhaar payment' })
    setPayFor(null); setPayAmt(0)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">{t('nav.customers')}</h2>
        <button onClick={() => setForm({})} className="btn-primary"><Plus size={18}/> Add Customer</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="text-sm font-semibold text-slate-500">Total Customers</div>
          <div className="text-3xl font-extrabold mt-1">{customers.length}</div>
          <UsersIcon className="text-brand-500 mt-2" size={22}/>
        </div>
        <div className="stat-card">
          <div className="text-sm font-semibold text-slate-500">Outstanding Udhaar</div>
          <div className="text-3xl font-extrabold mt-1 text-amber-600">{formatPKR(totalCredit)}</div>
          <Wallet className="text-amber-500 mt-2" size={22}/>
        </div>
      </div>

      <div className="card p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
              <th className="p-3">{t('common.name')}</th>
              <th className="p-3">{t('common.phone')}</th>
              <th className="p-3">{t('common.address')}</th>
              <th className="p-3 text-right">Credit</th>
              <th className="p-3 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 text-slate-600">{c.phone || '-'}</td>
                <td className="p-3 text-slate-600">{c.address || '-'}</td>
                <td className="p-3 text-right">
                  <span className={`font-bold ${c.credit > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{formatPKR(c.credit || 0)}</span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {c.credit > 0 && (
                      <button onClick={() => setPayFor(c)} className="chip bg-emerald-100 text-emerald-700 font-bold">Collect</button>
                    )}
                    <button onClick={() => setForm(c)} className="p-2 text-slate-500 hover:text-brand-600 rounded-lg"><Edit2 size={15}/></button>
                    <button onClick={() => del(c.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal onClose={() => setForm(null)} title={form.id ? 'Edit Customer' : 'Add Customer'}>
          <div className="space-y-3">
            <div><label className="label">Name</label><input className="input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}/></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})}/></div>
            <div><label className="label">Address</label><input className="input" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})}/></div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={save} className="btn-primary flex-1">{t('common.save')}</button>
            <button onClick={() => setForm(null)} className="btn-ghost flex-1">{t('common.cancel')}</button>
          </div>
        </Modal>
      )}

      {payFor && (
        <Modal onClose={() => setPayFor(null)} title={`Collect from ${payFor.name}`}>
          <div className="text-center py-3">
            <div className="text-sm text-slate-500">Outstanding</div>
            <div className="text-3xl font-extrabold text-amber-600">{formatPKR(payFor.credit)}</div>
          </div>
          <label className="label">Amount Received</label>
          <input type="number" className="input" value={payAmt} onChange={e => setPayAmt(e.target.value)} autoFocus/>
          <div className="flex gap-2 mt-5">
            <button onClick={collectPayment} className="btn-primary flex-1">Collect</button>
            <button onClick={() => setPayFor(null)} className="btn-ghost flex-1">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}
