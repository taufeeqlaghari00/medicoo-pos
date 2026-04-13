import { Link } from 'react-router-dom'
import { Heart, Shield, FileText } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="shrink-0 px-6 py-3 glass border-t border-white/60 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
      <div className="flex items-center gap-2 text-slate-600">
        <span>© {year}</span>
        <span className="text-slate-300">·</span>
        <span>Services by</span>
        <a href="#" className="font-black bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-wide">
          TAUFEEQ LAGHARI
        </a>
        <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse"/>
      </div>

      <div className="flex items-center gap-4 text-slate-500">
        <Link to="/privacy" className="hover:text-brand-600 transition flex items-center gap-1.5">
          <Shield size={12}/> Privacy Policy
        </Link>
        <span className="text-slate-300">·</span>
        <Link to="/terms" className="hover:text-brand-600 transition flex items-center gap-1.5">
          <FileText size={12}/> Terms & Conditions
        </Link>
        <span className="text-slate-300">·</span>
        <span className="font-bold text-slate-400">Medicoo v1.0</span>
      </div>
    </footer>
  )
}
