import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ur from './locales/ur.json'

const saved = localStorage.getItem('lang') || 'en'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ur: { translation: ur } },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

document.documentElement.dir = saved === 'ur' ? 'rtl' : 'ltr'
document.documentElement.lang = saved

export default i18n
