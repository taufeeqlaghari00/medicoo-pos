import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database.js'
import { useApp } from '../context/AppContext.jsx'
import { formatPKR, formatDateTime } from '../utils/format.js'
import { DollarSign, Lock, Unlock, TrendingUp, Banknote, Wallet, Clock, Check, History, AlertCircle } from 'lucide-react'

export default function ShiftClose() {
  const { currentBranch, admin } = useApp()
  const [opening, setOpening] = useState(0)
  const [closing, setClosing] = useState(0)
  const [note, setNote] = useState('')

  const openShift = useLiveQuery(
    () => db.shifts?.filter(s => s.branchId === currentBranch && s.status === 'open').first() || null,
    [currentBranch], null
  )

  const history = useLiveQuery(async () => {
    const all = (await db.shifts?.toArray()) || []
    return all.filter(s => s.branchId === currentBranch)
              .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt))
              .slice(0, 10)
  }, [currentBranch], [])

  // Live stats since shift open
  const live = useLiveQuery(async () => {
    if (!openShift) return null
    const sales = (await db.sales.toArray())
      .filter(s => s.branchId === currentBranch && s.status !== 'void' && new Date(s.date) >= new Date(openShift.openedAt))

    const byMethod = {}
    sales.forEach(s => {
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.total
    })
    const total = sales.reduce((a, s) => a + s.total, 0)
    return { sales, byMethod, total, count: sales.length }
  }, [openShift, currentBranch], null)

  const open = async () => {
    if (openShift) return
    await db.shifts.add({
      openedAt: new Date().toISOString(),
      openedBy: admin?.fullName || 'Admin',
      openingCash: Number(opening) || 0,
      status: 'open',
      branchId: currentBranch
    })
    setOpening(0)
  }

  const close = async () => {
    if (!openShift || !live) return
    const cashSales = live.byMethod.Cash || 0
    const expected = Number(openShift.openingCash) + cashSales
    const actual = Number(closing) || 0
    const variance = actual - expected
    await db.shifts.update(openShift.id, {
      closedAt: new Date().toISOString(),
      closingCash: actual,
      expectedCash: expected,
      variance,
      note,
      status: 'closed'
    })
    setClosing(0); setNote('')
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest mb-1">
          <DollarSign size={13}/> Cash Register
        </div>
        <h2 className="text-3xl font-black text-slate-800">Shift & Daily Cash</h2>
        <p className="text-slate-500 mt-1 text-sm">Open and close your daily cash register with variance tracking</p>
      </div>

      {!openShift ? (
        <OpenShiftCard opening={opening} setOpening={setOpening} onOpen={open}/>
      ) : (
        <ActiveShift
          shift={openShift}
          live={live}
          closing={closing}
          setClosing={setClosing}
          note={note}
          setNote={setNote}
          onClose={close}
        />
      )}

      <ShiftHistory history={history}/>
    </div>
  )
}

function OpenShiftCard({ opening, setOpening, onOpen }) {
  return (
    <div className="card p-10 relative overflow-hidden text-center">
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-100 blur-3xl"/>
      <div className="relative">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-2xl mb-5">
          <Lock className="text-white" size={34}/>
        </div>
        <h3 className="font-black text-2xl">No active shift</h3>
        <p className="text-slate-500 text-sm mt-1 mb-7">Enter the opening cash amount to start your shift</p>

        <div className="max-w-sm mx-auto">
          <label className="label text-left">Opening Cash (PKR)</label>
          <input type="number" value={opening} onChange={e => setOpening(e.target.value)}
                 className="input text-center text-2xl font-black" placeholder="0" autoFocus/>
          <button onClick={onOpen} className="btn-primary w-full mt-4 py-3">
            <Unlock size={18}/> Open Shift
          </button>
        </div>
      </div>
    </div>
  )
}

function ActiveShift({ shift, live, closing, setClosing, note, setNote, onClose }) {
  if (!live) return null
  const cashSales = live.byMethod.Cash || 0
  const jazzcash = live.byMethod.JazzCash || 0
  const easypaisa = live.byMethod.Easypaisa || 0
  const bank = live.byMethod.Bank || 0
  const credit = live.byMethod.Credit || 0
  const expected = Number(shift.openingCash) + cashSales
  const variance = (Number(closing) || 0) - expected

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {/* Status banner */}
        <div className="card p-6 bg-gradient-to-br from-brand-600 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl"/>
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"/> Shift Active
              </div>
              <div className="font-black text-2xl mt-1">Opened by {shift.openedBy}</div>
              <div className="text-xs text-white/70 mt-1 flex items-center gap-1.5">
                <Clock size={12}/> {formatDateTime(shift.openedAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70 font-bold uppercase tracking-wider">Sales This Shift</div>
              <div className="text-3xl font-black">{formatPKR(live.total)}</div>
              <div className="text-xs text-white/70">{live.count} transactions</div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="card p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-600"/> Payment Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <PaymentStat icon={Banknote} label="Cash" amount={cashSales} color="emerald"/>
            <PaymentStat icon={Wallet} label="JazzCash" amount={jazzcash} color="orange"/>
            <PaymentStat icon={Wallet} label="Easypaisa" amount={easypaisa} color="green"/>
            <PaymentStat icon={Wallet} label="Bank" amount={bank} color="blue"/>
            <PaymentStat icon={Wallet} label="Udhaar" amount={credit} color="rose"/>
            <PaymentStat icon={TrendingUp} label="TOTAL" amount={live.total} color="brand" highlight/>
          </div>
        </div>
      </div>

      {/* Close shift form */}
      <div className="card p-6">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
          <Lock size={18} className="text-brand-600"/> Close Shift
        </h3>

        <div className="space-y-3 mb-4 text-sm">
          <Row label="Opening Cash" value={formatPKR(shift.openingCash)}/>
          <Row label="Cash Sales" value={formatPKR(cashSales)}/>
          <div className="pt-3 border-t border-slate-100">
            <Row label="Expected in Drawer" value={formatPKR(expected)} bold/>
          </div>
        </div>

        <label className="label">Actual Cash Counted</label>
        <input type="number" value={closing} onChange={e => setClosing(e.target.value)}
               className="input text-center text-xl font-black mb-3" placeholder="0"/>

        {Number(closing) > 0 && (
          <div className={`p-3 rounded-xl border-2 mb-3 text-center ${
            variance === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            variance > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' :
            'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider">Variance</div>
            <div className="font-black text-xl flex items-center justify-center gap-1">
              {variance !== 0 && <AlertCircle size={18}/>}
              {variance >= 0 ? '+' : ''}{formatPKR(variance)}
            </div>
          </div>
        )}

        <label className="label">Note (optional)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows="2"
                  className="input resize-none" placeholder="Any discrepancy reason..."/>

        <button onClick={onClose} className="btn-primary w-full mt-4 py-3">
          <Lock size={16}/> Close Shift & Lock
        </button>
      </div>
    </div>
  )
}

function PaymentStat({ icon: Icon, label, amount, color, highlight }) {
  return (
    <div className={`p-4 rounded-2xl ${highlight ? 'bg-gradient-to-br from-brand-500 to-emerald-700 text-white' : `bg-${color}-50`}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={highlight ? 'text-white' : `text-${color}-600`}/>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-white/80' : 'text-slate-500'}`}>{label}</span>
      </div>
      <div className={`font-black text-lg ${highlight ? 'text-white' : 'text-slate-800'}`}>{formatPKR(amount)}</div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`${bold ? 'font-black text-lg text-slate-800' : 'font-bold text-slate-700'}`}>{value}</span>
    </div>
  )
}

function ShiftHistory({ history }) {
  return (
    <div className="card p-6">
      <h3 className="font-black text-lg mb-4 flex items-center gap-2">
        <History size={18} className="text-brand-600"/> Recent Shifts
      </h3>
      {history.length === 0 && <p className="text-slate-400 text-sm">No shifts recorded yet</p>}
      <div className="space-y-2">
        {history.map(s => (
          <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {s.status === 'open' ? <Unlock size={16}/> : <Check size={16}/>}
              </div>
              <div>
                <div className="font-bold text-sm">{s.openedBy}</div>
                <div className="text-xs text-slate-500">{formatDateTime(s.openedAt)}{s.closedAt ? ` → ${formatDateTime(s.closedAt)}` : ''}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-semibold">{s.status === 'open' ? 'Opening' : 'Closed'}</div>
              <div className="font-black text-brand-600">{formatPKR(s.closingCash || s.openingCash)}</div>
              {s.variance !== undefined && s.variance !== 0 && (
                <div className={`text-xs font-bold ${s.variance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {s.variance > 0 ? '+' : ''}{formatPKR(s.variance)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
