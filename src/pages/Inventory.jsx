import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../db/database.js'
import { useApp } from '../context/AppContext.jsx'
import { formatPKR, formatDate, daysUntil } from '../utils/format.js'
import { Plus, Search, Edit2, Trash2, AlertTriangle, X, Package } from 'lucide-react'

const CATEGORIES = ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Creams', 'Drops', 'Surgical Items', 'OTC']

export default function Inventory() {
  const { t } = useTranslation()
  const { currentBranch } = useApp()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const medicines = useLiveQuery(
    () => db.medicines.filter(m => m.branchId === currentBranch).toArray(),
    [currentBranch], []
  )
  const batches = useLiveQuery(
    () => db.batches.filter(b => b.branchId === currentBranch).toArray(),
    [currentBranch], []
  )
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), [], [])

  const rows = useMemo(() => {
    const q = query.toLowerCase()
    return medicines
      .filter(m => !q || m.name.toLowerCase().includes(q) || m.generic?.toLowerCase().includes(q) || m.barcode?.includes(query))
      .map(m => {
        const mBatches = batches.filter(b => b.medicineId === m.id)
        const stock = mBatches.reduce((a, b) => a + b.qty, 0)
        const earliest = mBatches.sort((a, z) => new Date(a.expiry) - new Date(z.expiry))[0]
        return { ...m, stock, batch: earliest }
      })
  }, [medicines, batches, query])

  const openAdd = () => { setEditing({}); setShowForm(true) }
  const openEdit = (m) => { setEditing(m); setShowForm(true) }
  const del = async (id) => {
    if (!confirm('Delete this medicine?')) return
    await db.medicines.delete(id)
    await db.batches.where('medicineId').equals(id).delete()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-800">{t('inventory.title')}</h2>
        <button onClick={openAdd} className="btn-primary"><Plus size={18}/> {t('inventory.addMedicine')}</button>
      </div>

      <div className="card p-4">
        <div className="relative mb-4">
          <Search className="absolute top-3.5 left-4 text-slate-400" size={18} />
          <input className="input pl-11" placeholder={t('common.search')}
                 value={query} onChange={e => setQuery(e.target.value)}/>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="p-3">{t('common.name')}</th>
                <th className="p-3">{t('inventory.generic')}</th>
                <th className="p-3">{t('inventory.category')}</th>
                <th className="p-3 text-right">{t('inventory.purchasePrice')}</th>
                <th className="p-3 text-right">{t('inventory.salePrice')}</th>
                <th className="p-3 text-center">{t('inventory.stock')}</th>
                <th className="p-3">{t('inventory.expiry')}</th>
                <th className="p-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan="8" className="text-center py-10 text-slate-400">
                  <Package className="mx-auto mb-2" size={36}/> No medicines found
                </td></tr>
              )}
              {rows.map(m => {
                const expDays = m.batch ? daysUntil(m.batch.expiry) : null
                const lowStock = m.stock < 10
                const nearExp = expDays !== null && expDays <= 90
                return (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.brand}</div>
                    </td>
                    <td className="p-3 text-slate-600">{m.generic}</td>
                    <td className="p-3"><span className="chip bg-slate-100 text-slate-600">{m.category}</span></td>
                    <td className="p-3 text-right">{formatPKR(m.purchasePrice)}</td>
                    <td className="p-3 text-right font-bold text-brand-600">{formatPKR(m.salePrice)}</td>
                    <td className="p-3 text-center">
                      <span className={`chip ${lowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {lowStock && <AlertTriangle size={11}/>}
                        {m.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      {m.batch ? (
                        <span className={`chip ${nearExp ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {formatDate(m.batch.expiry)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(m)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={15}/></button>
                        <button onClick={() => del(m.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <MedicineForm
          data={editing}
          suppliers={suppliers}
          branchId={currentBranch}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function MedicineForm({ data, suppliers, branchId, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    name: data.name || '', generic: data.generic || '', brand: data.brand || '',
    category: data.category || 'Tablets', barcode: data.barcode || '',
    purchasePrice: data.purchasePrice || 0, salePrice: data.salePrice || 0,
    rack: data.rack || '', gstExempt: data.gstExempt || false, supplierId: data.supplierId || 1,
    batchNo: '', expiry: '', qty: 0
  })

  const save = async () => {
    if (!form.name) return alert('Name required')
    if (data.id) {
      // preserve branchId when updating
      await db.medicines.update(data.id, {
        name: form.name, generic: form.generic, brand: form.brand,
        category: form.category, barcode: form.barcode,
        purchasePrice: Number(form.purchasePrice), salePrice: Number(form.salePrice),
        rack: form.rack, gstExempt: form.gstExempt, supplierId: Number(form.supplierId)
      })
    } else {
      const id = await db.medicines.add({
        name: form.name, generic: form.generic, brand: form.brand,
        category: form.category, barcode: form.barcode,
        purchasePrice: Number(form.purchasePrice), salePrice: Number(form.salePrice),
        rack: form.rack, gstExempt: form.gstExempt, supplierId: Number(form.supplierId),
        branchId, createdAt: Date.now()
      })
      if (form.qty > 0) {
        await db.batches.add({
          medicineId: id, batchNo: form.batchNo || 'B' + Date.now(),
          expiry: form.expiry, qty: Number(form.qty), purchasePrice: Number(form.purchasePrice), branchId
        })
      }
    }
    onClose()
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-xl">{data.id ? t('inventory.editMedicine') : t('inventory.addMedicine')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('common.name')} value={form.name} onChange={f('name')} />
          <Field label={t('inventory.generic')} value={form.generic} onChange={f('generic')} />
          <Field label={t('inventory.brand')} value={form.brand} onChange={f('brand')} />
          <div>
            <label className="label">{t('inventory.category')}</label>
            <select className="input" value={form.category} onChange={f('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label={t('inventory.barcode')} value={form.barcode} onChange={f('barcode')} />
          <Field label={t('inventory.rack')} value={form.rack} onChange={f('rack')} />
          <Field label={t('inventory.purchasePrice')} type="number" value={form.purchasePrice} onChange={f('purchasePrice')} />
          <Field label={t('inventory.salePrice')} type="number" value={form.salePrice} onChange={f('salePrice')} />
          <div>
            <label className="label">{t('inventory.supplier')}</label>
            <select className="input" value={form.supplierId} onChange={f('supplierId')}>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 mt-7">
            <input type="checkbox" checked={form.gstExempt} onChange={f('gstExempt')} className="w-4 h-4 accent-brand-600"/>
            <span className="font-semibold text-sm">{t('inventory.gstExempt')}</span>
          </label>

          {!data.id && (
            <>
              <div className="col-span-2 border-t border-slate-100 mt-2 pt-3 font-bold text-slate-600">Initial Batch</div>
              <Field label={t('inventory.batchNo')} value={form.batchNo} onChange={f('batchNo')} />
              <Field label={t('inventory.expiry')} type="date" value={form.expiry} onChange={f('expiry')} />
              <Field label={t('inventory.stock')} type="number" value={form.qty} onChange={f('qty')} />
            </>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={save} className="btn-primary flex-1">{t('common.save')}</button>
          <button onClick={onClose} className="btn-ghost flex-1">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={value} onChange={onChange} className="input"/>
    </div>
  )
}
