import { formatPKR, formatDateTime } from '../../utils/format.js'

export default function Receipt({ data }) {
  const { sale, items, pharmacy } = data
  return (
    <div id="receipt" className="font-mono text-xs text-slate-800 bg-white p-4 border border-dashed border-slate-300 rounded-xl">
      <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
        <div className="text-lg font-extrabold tracking-wide">{pharmacy?.name || 'MEDICOO'}</div>
        <div>{pharmacy?.tagline}</div>
        <div>{pharmacy?.address}</div>
        <div>Tel: {pharmacy?.phone}</div>
        <div>NTN: {pharmacy?.ntn} | STRN: {pharmacy?.strn}</div>
      </div>

      <div className="flex justify-between">
        <span>Invoice:</span><span className="font-bold">{sale.invoiceNo}</span>
      </div>
      <div className="flex justify-between">
        <span>Date:</span><span>{formatDateTime(sale.date)}</span>
      </div>
      <div className="flex justify-between">
        <span>Payment:</span><span>{sale.paymentMethod}</span>
      </div>

      <div className="border-t border-dashed border-slate-400 mt-2 pt-2">
        <div className="grid grid-cols-12 font-bold border-b border-dashed border-slate-300 pb-1">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-4 text-right">Amount</div>
        </div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 py-1">
            <div className="col-span-6 truncate">{it.med?.name}</div>
            <div className="col-span-2 text-right">{it.qty}</div>
            <div className="col-span-4 text-right">{formatPKR(it.price * it.qty)}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-slate-400 mt-2 pt-2 space-y-0.5">
        <Line l="Subtotal" v={formatPKR(sale.subtotal)} />
        <Line l="GST" v={formatPKR(sale.gst)} />
        <Line l="Discount" v={`- ${formatPKR(sale.discount)}`} />
        <div className="flex justify-between font-extrabold text-sm border-t border-dashed border-slate-400 pt-1 mt-1">
          <span>TOTAL</span><span>{formatPKR(sale.total)}</span>
        </div>
      </div>

      <div className="text-center mt-3 pt-2 border-t border-dashed border-slate-400">
        <div>Thank you for your visit!</div>
        <div>شکریہ — پھر تشریف لائیں</div>
      </div>
    </div>
  )
}

const Line = ({ l, v }) => (
  <div className="flex justify-between"><span>{l}:</span><span>{v}</span></div>
)
