import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div className="h-full flex bg-blobs bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
