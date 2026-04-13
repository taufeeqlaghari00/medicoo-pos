import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../db/database.js'
import { useApp } from '../context/AppContext.jsx'
import { formatPKR, formatDate } from '../utils/format.js'
import { Lock, Eye, EyeOff, ShieldCheck, Plus, Edit2, Trash2, X, UserCircle2, Mail, Phone, Briefcase, IdCard, Unlock } from 'lucide-react'

export default function Employees() {
  const { admin } = useApp()
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  const unlock = (e) => {
    e.preventDefault()
    if (pw === admin?.password) {
      setUnlocked(true)
      setErr('')
    } else {
      setErr('Wrong admin password. Access denied.')
    }
  }

  if (!unlocked) return <LockScreen pw={pw} setPw={setPw} show={show} setShow={setShow} err={err} unlock={unlock}/>
  return <EmployeesList onLock={() => { setUnlocked(false); setPw('') }}/>
}

function LockScreen({ pw, setPw, show, setShow, err, unlock }) {
  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="card p-10 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-brand-100 blur-3xl"/>
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-amber-100 blur-3xl"/>

          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-2xl mb-5 animate-pulse-glow">
              <Lock className="text-brand-400" size={36}/>
            </div>

            <h2 className="text-2xl font-black text-slate-800">Protected Area</h2>
            <p className="text-slate-500 text-sm mt-1 mb-7">
              This panel is locked. Enter the <span className="font-bold text-slate-700">admin password</span> to manage employees.
            </p>

            <form onSubmit={unlock} className="space-y-4">
              <div className="relative">
                <Lock size={18} className="absolute top-3.5 left-4 text-slate-400"/>
                <input
                  autoFocus
                  type={show ? 'text' : 'password'}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Admin password"
                  className="input pl-11 pr-11 text-center text-base tracking-wider"
                />
                <button type="button" onClick={() => setShow(!show)}
                        className="absolute top-3.5 right-4 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              {err && (
                <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold animate-fade-in">
                  {err}
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3.5 text-base">
                <Unlock size={18}/> Unlock Access
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold">
              <ShieldCheck size={12}/> Secured by Medicoo
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ROLES = ['Pharmacist', 'Cashier', 'Sales Person', 'Store Manager', 'Helper', 'Delivery']

function EmployeesList({ onLock }) {
  const [form, setForm] = useState(null)
  const employees = useLiveQuery(() => db.employees?.toArray() || [], [], [])

  const save = async () => {
    if (!form.name) return alert('Name required')
    const payload = {
      name: form.name, phone: form.phone || '', email: form.email || '',
      role: form.role || 'Cashier', cnic: form.cnic || '',
      salary: Number(form.salary || 0), joinDate: form.joinDate || new Date().toISOString().slice(0,10),
      branchId: 1
    }
    if (form.id) await db.employees.update(form.id, payload)
    else await db.employees.add(payload)
    setForm(null)
  }

  const del = async (id) => {
    if (confirm('Delete this employee?')) await db.employees.delete(id)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest mb-1">
            <ShieldCheck size={13}/> Unlocked
          </div>
          <h2 className="text-3xl font-black text-slate-800">Employees</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage staff, roles and salaries</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onLock} className="btn-ghost"><Lock size={16}/> Lock</button>
          <button onClick={() => setForm({})} className="btn-primary"><Plus size={16}/> Add Employee</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.length === 0 && (
          <div className="col-span-full card p-12 text-center text-slate-400">
            <UserCircle2 size={48} className="mx-auto mb-2"/>
            <div className="font-semibold">No employees yet</div>
            <div className="text-xs mt-1">Click "Add Employee" to get started</div>
          </div>
        )}

        {employees.map(e => {
          const initials = (e.name || 'E').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()
          return (
            <div key={e.id} className="card p-6 group relative overflow-hidden hover:shadow-2xl hover:shadow-brand-500/10 transition-all">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-brand-50 opacity-0 group-hover:opacity-100 transition blur-2xl"/>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 via-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-brand-500/30">
                    {initials}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => setForm(e)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={15}/></button>
                    <button onClick={() => del(e.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </div>

                <div className="font-black text-lg text-slate-800">{e.name}</div>
                <div className="chip bg-brand-100 text-brand-700 mt-1">{e.role}</div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  {e.phone && <Row icon={Phone} text={e.phone}/>}
                  {e.email && <Row icon={Mail} text={e.email}/>}
                  {e.cnic && <Row icon={IdCard} text={e.cnic}/>}
                  {e.joinDate && <Row icon={Briefcase} text={`Joined ${formatDate(e.joinDate)}`}/>}
                </div>

                {e.salary > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Salary</span>
                    <span className="font-black text-brand-600">{formatPKR(e.salary)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {form && <EmployeeForm data={form} onClose={() => setForm(null)} onSave={save} setForm={setForm}/>}
    </div>
  )
}

function Row({ icon: Icon, text }) {
  return <div className="flex items-center gap-2"><Icon size={13} className="text-slate-400"/> <span>{text}</span></div>
}

function EmployeeForm({ data, onClose, onSave, setForm }) {
  const f = (k) => (e) => setForm({ ...data, [k]: e.target.value })
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-black text-xl">{data.id ? 'Edit Employee' : 'Add New Employee'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" value={data.name || ''} onChange={f('name')}/>
          <div>
            <label className="label">Role</label>
            <select className="input" value={data.role || 'Cashier'} onChange={f('role')}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <Field label="Phone" value={data.phone || ''} onChange={f('phone')}/>
          <Field label="Email" value={data.email || ''} onChange={f('email')}/>
          <Field label="CNIC" value={data.cnic || ''} onChange={f('cnic')} placeholder="xxxxx-xxxxxxx-x"/>
          <Field label="Salary (PKR)" type="number" value={data.salary || ''} onChange={f('salary')}/>
          <div className="md:col-span-2">
            <Field label="Join Date" type="date" value={data.joinDate || ''} onChange={f('joinDate')}/>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onSave} className="btn-primary flex-1">Save Employee</button>
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input"/>
    </div>
  )
}
