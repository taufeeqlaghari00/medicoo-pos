import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../db/database.js'
import { Plus, Edit2, Trash2, X, Truck } from 'lucide-react'

export default function Suppliers() {
  const { t } = useTranslation()
  const [form, setForm] = useState(null)
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), [], [])

  const save = async () => {
    if (!form.name) return
    if (form.id) await db.suppliers.update(form.id, { name: form.name, phone: form.phone, address: form.address })
    else await db.suppliers.add({ name: form.name, phone: form.phone || '', address: form.address || '' })
    setForm(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">{t('nav.suppliers')}</h2>
        <button onClick={() => setForm({})} className="btn-primary"><Plus size={18}/> Add Supplier</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map(s => (
          <div key={s.id} className="card p-5 hover:shadow-soft transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-soft">
                <Truck size={20}/>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setForm(s)} className="p-2 text-slate-500 hover:text-brand-600 rounded-lg"><Edit2 size={15}/></button>
                <button onClick={() => confirm('Delete?') && db.suppliers.delete(s.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-lg"><Trash2 size={15}/></button>
              </div>
            </div>
            <div className="font-bold text-lg">{s.name}</div>
            <div className="text-sm text-slate-500 mt-1">{s.phone || '-'}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.address}</div>
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{form.id ? 'Edit' : 'Add'} Supplier</h3>
              <button onClick={() => setForm(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Name</label><input className="input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}/></div>
              <div><label className="label">Phone</label><input className="input" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})}/></div>
              <div><label className="label">Address</label><input className="input" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})}/></div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} className="btn-primary flex-1">{t('common.save')}</button>
              <button onClick={() => setForm(null)} className="btn-ghost flex-1">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
