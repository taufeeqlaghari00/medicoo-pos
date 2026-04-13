export const formatPKR = (n) => {
  const num = Number(n || 0)
  return '₨ ' + num.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export const formatDate = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export const formatDateTime = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  return formatDate(date) + ' ' + date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
}

export const daysUntil = (dateStr) => {
  if (!dateStr) return Infinity
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
