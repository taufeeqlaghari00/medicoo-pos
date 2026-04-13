import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getSetting, setSetting, db } from '../db/database.js'
import { useApp } from '../context/AppContext.jsx'
import { Save, Building2, Receipt, Globe, Plus, Trash2, UserCog, Lock, Check, Eye, EyeOff, LogOut } from 'lucide-react'

export default function Settings() {
  const { t } = useTranslation()
  const { pharmacy, setPharmacy, branches, setBranches, lang, changeLang, admin, updateAdmin, logout } = useApp()
  const [local, setLocal] = useState(pharmacy || {})
  const [tax, setTax] = useState({ gstRate: 18, enabled: true })
  const [newBranch, setNewBranch] = useState('')
  const [tab, setTab] = useState('admin')
  const [saved, setSaved] = useState('')

  useEffect(() => { getSetting('tax').then(t => t && setTax(t)) }, [])

  const flash = (msg) => { setSaved(msg); setTimeout(() => setSaved(''), 2000) }

  const savePharmacy = async () => {
    await setSetting('pharmacy', local); setPharmacy(local); flash('Pharmacy info saved ✓')
  }
  const saveTax = async () => { await setSetting('tax', tax); flash('Tax settings saved ✓') }

  const addBranch = async () => {
    if (!newBranch) return
    await db.branches.add({ name: newBranch, code: newBranch.slice(0, 3).toUpperCase() })
    setBranches(await db.branches.toArray()); setNewBranch(''); flash('Branch added ✓')
  }
  const delBranch = async (id) => {
    if (branches.length <= 1) return alert('Keep at least one branch')
    if (!confirm('Delete branch?')) return
    await db.branches.delete(id); setBranches(await db.branches.toArray())
  }

  const tabs = [
    { id: 'admin', label: 'Admin Profile', icon: UserCog },
    { id: 'pharmacy', label: 'Pharmacy', icon: Building2 },
    { id: 'tax', label: 'Tax & GST', icon: Receipt },
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'language', label: 'Language', icon: Globe }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800">{t('nav.settings')}</h2>
          <p className="text-slate-500 mt-1">Manage your pharmacy, admin, and preferences</p>
        </div>
        <button onClick={logout} className="btn-ghost text-red-600 border-red-200 hover:bg-red-50">
          <LogOut size={16}/> Sign Out
        </button>
      </div>

      {saved && (
        <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-2xl shadow-emerald-500/40 flex items-center gap-2 animate-slide-up">
          <Check size={18}/> {saved}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-3 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                  tab === id
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-soft'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}>
                <Icon size={17}/> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === 'admin' && <AdminPanel admin={admin} updateAdmin={updateAdmin} onSaved={flash}/>}

          {tab === 'pharmacy' && (
            <div className="card p-7">
              <h3 className="font-black text-xl mb-5 flex items-center gap-2">
                <Building2 className="text-brand-600" size={22}/> Pharmacy Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name" value={local.name || ''} onChange={e => setLocal({...local, name: e.target.value})}/>
                <Field label="Tagline" value={local.tagline || ''} onChange={e => setLocal({...local, tagline: e.target.value})}/>
                <Field label="NTN" value={local.ntn || ''} onChange={e => setLocal({...local, ntn: e.target.value})}/>
                <Field label="STRN" value={local.strn || ''} onChange={e => setLocal({...local, strn: e.target.value})}/>
                <Field label="Phone" value={local.phone || ''} onChange={e => setLocal({...local, phone: e.target.value})}/>
                <Field label="Email" value={local.email || ''} onChange={e => setLocal({...local, email: e.target.value})}/>
                <div className="md:col-span-2"><Field label="Address" value={local.address || ''} onChange={e => setLocal({...local, address: e.target.value})}/></div>
              </div>
              <button onClick={savePharmacy} className="btn-primary mt-6"><Save size={16}/> Save Changes</button>
            </div>
          )}

          {tab === 'tax' && (
            <div className="card p-7">
              <h3 className="font-black text-xl mb-5 flex items-center gap-2">
                <Receipt className="text-brand-600" size={22}/> Tax & GST Settings
              </h3>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-100 mb-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-800">Enable GST on Sales</div>
                    <div className="text-xs text-slate-500 mt-0.5">Pakistan Sales Tax (currently 18%)</div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={tax.enabled} onChange={e => setTax({...tax, enabled: e.target.checked})} className="sr-only peer"/>
                    <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-brand-500 transition"/>
                    <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition peer-checked:translate-x-5"/>
                  </div>
                </label>
              </div>
              <Field label="GST Rate (%)" type="number" value={tax.gstRate} onChange={e => setTax({...tax, gstRate: Number(e.target.value)})}/>
              <button onClick={saveTax} className="btn-primary mt-6"><Save size={16}/> Save</button>
            </div>
          )}

          {tab === 'branches' && (
            <div className="card p-7">
              <h3 className="font-black text-xl mb-5 flex items-center gap-2">
                <Building2 className="text-brand-600" size={22}/> Manage Branches
              </h3>
              <div className="space-y-2 mb-5">
                {branches.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">
                        {b.code?.slice(0, 2) || 'BR'}
                      </div>
                      <div>
                        <div className="font-bold">{b.name}</div>
                        <div className="text-xs text-slate-500">Code: {b.code}</div>
                      </div>
                    </div>
                    <button onClick={() => delBranch(b.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="New branch name" value={newBranch} onChange={e => setNewBranch(e.target.value)}/>
                <button onClick={addBranch} className="btn-primary"><Plus size={16}/> Add</button>
              </div>
            </div>
          )}

          {tab === 'language' && (
            <div className="card p-7">
              <h3 className="font-black text-xl mb-5 flex items-center gap-2">
                <Globe className="text-brand-600" size={22}/> Language
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[{id:'en',name:'English',flag:'🇬🇧'},{id:'ur',name:'اردو Urdu',flag:'🇵🇰'}].map(l => (
                  <button key={l.id} onClick={() => changeLang(l.id)}
                    className={`p-6 rounded-2xl border-2 transition text-left ${lang === l.id ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="text-3xl mb-2">{l.flag}</div>
                    <div className="font-black text-lg">{l.name}</div>
                    {lang === l.id && <div className="mt-2 text-xs font-bold text-brand-600 flex items-center gap-1"><Check size={13}/> Active</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AdminPanel({ admin, updateAdmin, onSaved }) {
  const [form, setForm] = useState(admin || {})
  const [showPw, setShowPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [pwErr, setPwErr] = useState('')

  useEffect(() => setForm(admin || {}), [admin])

  const saveProfile = async () => {
    await updateAdmin({ ...admin, ...form })
    onSaved('Profile updated ✓')
  }

  const changePassword = async () => {
    setPwErr('')
    if (currentPw !== admin.password) return setPwErr('Current password is wrong')
    if (!newPw || newPw.length < 4) return setPwErr('New password too short (min 4)')
    if (newPw !== confirmPw) return setPwErr('Passwords do not match')
    await updateAdmin({ ...admin, ...form, password: newPw })
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    onSaved('Password changed ✓')
  }

  const initials = (form.fullName || 'A').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="card p-7">
        <h3 className="font-black text-xl mb-5 flex items-center gap-2">
          <UserCog className="text-brand-600" size={22}/> Admin Profile
        </h3>

        <div className="flex items-center gap-5 mb-6 p-5 rounded-2xl bg-gradient-to-br from-brand-50 via-emerald-50 to-teal-50 border border-brand-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-black shadow-soft shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="font-black text-xl">{form.fullName || 'Admin'}</div>
            <div className="text-sm text-slate-500">{form.email}</div>
            <div className="chip bg-brand-100 text-brand-700 mt-2">{form.role || 'Super Admin'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" value={form.fullName || ''} onChange={e => setForm({...form, fullName: e.target.value})}/>
          <Field label="Username" value={form.username || ''} onChange={e => setForm({...form, username: e.target.value})}/>
          <Field label="Email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}/>
          <Field label="Phone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})}/>
          <div className="md:col-span-2">
            <Field label="Role" value={form.role || ''} onChange={e => setForm({...form, role: e.target.value})}/>
          </div>
        </div>

        <button onClick={saveProfile} className="btn-primary mt-6"><Save size={16}/> Save Profile</button>
      </div>

      {/* Password card */}
      <div className="card p-7">
        <h3 className="font-black text-xl mb-5 flex items-center gap-2">
          <Lock className="text-brand-600" size={22}/> Change Password
        </h3>

        <div className="space-y-4 max-w-md">
          <PwField label="Current Password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} show={showPw} setShow={setShowPw}/>
          <PwField label="New Password" value={newPw} onChange={e => setNewPw(e.target.value)} show={showPw} setShow={setShowPw}/>
          <PwField label="Confirm New Password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} show={showPw} setShow={setShowPw}/>

          {pwErr && (
            <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">{pwErr}</div>
          )}

          <button onClick={changePassword} className="btn-primary"><Lock size={16}/> Update Password</button>
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

function PwField({ label, value, onChange, show, setShow }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} className="input pr-11"/>
        <button type="button" onClick={() => setShow(!show)} className="absolute top-3 right-3.5 text-slate-400 hover:text-slate-600">
          {show ? <EyeOff size={18}/> : <Eye size={18}/>}
        </button>
      </div>
    </div>
  )
}
