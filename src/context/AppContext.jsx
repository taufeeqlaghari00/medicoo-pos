import { createContext, useContext, useEffect, useState } from 'react'
import { db, seedDefaults, getSetting, setSetting } from '../db/database.js'
import i18n from '../i18n'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [pharmacy, setPharmacy] = useState(null)
  const [currentBranch, setCurrentBranch] = useState(1)
  const [branches, setBranches] = useState([])
  const [online, setOnline] = useState(navigator.onLine)
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')
  const [admin, setAdmin] = useState(null)
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('medicoo_auth') === '1')

  useEffect(() => {
    (async () => {
      await seedDefaults()
      setPharmacy(await getSetting('pharmacy'))
      setAdmin(await getSetting('admin'))
      setCurrentBranch(await getSetting('currentBranch', 1))
      setBranches(await db.branches.toArray())
      setReady(true)
    })()
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem('lang', l)
    i18n.changeLanguage(l)
    document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }

  const changeBranch = async (id) => {
    setCurrentBranch(id)
    await setSetting('currentBranch', id)
  }

  const login = (a) => {
    setIsAuthed(true)
    sessionStorage.setItem('medicoo_auth', '1')
    setAdmin(a)
  }

  const logout = () => {
    setIsAuthed(false)
    sessionStorage.removeItem('medicoo_auth')
  }

  const updateAdmin = async (next) => {
    await setSetting('admin', next)
    setAdmin(next)
  }

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center animate-pulse shadow-soft">
            <span className="text-white text-3xl font-extrabold">M</span>
          </div>
          <p className="mt-4 text-slate-600 font-semibold">Loading Medicoo...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ pharmacy, setPharmacy, currentBranch, changeBranch, branches, setBranches, online, lang, changeLang, admin, updateAdmin, isAuthed, login, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
