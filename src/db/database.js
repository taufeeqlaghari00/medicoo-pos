import Dexie from 'dexie'
import { v4 as uuid } from 'uuid'

export const db = new Dexie('medicoo_pos')

db.version(1).stores({
  branches:      '++id, name, code',
  medicines:     '++id, name, generic, brand, category, barcode, supplierId, branchId',
  batches:       '++id, medicineId, batchNo, expiry, qty, branchId',
  sales:         '++id, invoiceNo, date, customerId, total, status, branchId, paymentMethod, syncStatus',
  saleItems:     '++id, saleId, medicineId, batchId, qty, price, discount, gst',
  returns:       '++id, saleId, date, reason, amount, branchId',
  customers:     '++id, name, phone, credit, branchId',
  payments:      '++id, customerId, amount, date, note',
  suppliers:     '++id, name, phone, address',
  purchases:     '++id, supplierId, date, total, branchId',
  purchaseItems: '++id, purchaseId, medicineId, qty, price',
  settings:      '&key, value',
  users:         '++id, username, role, branchId'
})

db.version(2).stores({
  employees: '++id, name, phone, email, role, cnic, salary, joinDate, branchId'
})

db.version(3).stores({
  shifts: '++id, openedAt, closedAt, openedBy, openingCash, closingCash, expectedCash, variance, branchId, status, note'
})

// Seed defaults
export async function seedDefaults() {
  // Ensure admin setting always exists (for upgrades)
  const existingAdmin = await db.settings.get('admin')
  if (!existingAdmin) {
    await db.settings.put({ key: 'admin', value: {
      username: 'admin',
      password: 'admin123',
      fullName: 'Pharmacy Admin',
      email: 'admin@medicoo.pk',
      phone: '+92 300 0000000',
      avatar: '',
      role: 'Super Admin'
    }})
  }

  const count = await db.settings.count()
  if (count > 1) return

  await db.settings.bulkPut([
    { key: 'pharmacy', value: {
      name: 'Medicoo Pharmacy',
      tagline: 'Your Trusted Health Partner',
      ntn: '1234567-8',
      strn: '17-XX-XXXX-XXX-XX',
      address: 'Shop #12, Main Bazaar, Lahore, Pakistan',
      phone: '+92 300 1234567',
      email: 'info@medicoo.pk',
      logo: 'medicoo'
    }},
    { key: 'admin', value: {
      username: 'admin',
      password: 'admin123',
      fullName: 'Pharmacy Admin',
      email: 'admin@medicoo.pk',
      phone: '+92 300 0000000',
      avatar: '',
      role: 'Super Admin'
    }},
    { key: 'tax', value: { gstRate: 18, enabled: true } },
    { key: 'language', value: 'en' },
    { key: 'currency', value: 'PKR' },
    { key: 'currentBranch', value: 1 },
    { key: 'alerts', value: { lowStock: 10, expiryDays: 90 } }
  ])

  const branchId = await db.branches.add({ name: 'Main Branch — Lahore', code: 'LHR-01', address: 'Shop #12, Main Bazaar, Lahore' })
  await db.branches.add({ name: 'Branch 2 — Karachi', code: 'KHI-01', address: 'Shop #5, Tariq Road, Karachi' })

  // Sample medicines (Pakistani common meds)
  const meds = [
    { name: 'Panadol Extra', generic: 'Paracetamol + Caffeine', brand: 'GSK', category: 'Tablets', barcode: '8964000100012', purchasePrice: 18, salePrice: 25, rack: 'A1', gstExempt: false },
    { name: 'Brufen 400mg', generic: 'Ibuprofen', brand: 'Abbott', category: 'Tablets', barcode: '8964000100029', purchasePrice: 60, salePrice: 85, rack: 'A2', gstExempt: false },
    { name: 'Augmentin 625mg', generic: 'Amoxicillin+Clavulanate', brand: 'GSK', category: 'Tablets', barcode: '8964000100036', purchasePrice: 280, salePrice: 360, rack: 'B1', gstExempt: true },
    { name: 'Disprin', generic: 'Aspirin', brand: 'Reckitt', category: 'Tablets', barcode: '8964000100043', purchasePrice: 8, salePrice: 12, rack: 'A3', gstExempt: false },
    { name: 'Ventolin Inhaler', generic: 'Salbutamol', brand: 'GSK', category: 'Injections', barcode: '8964000100050', purchasePrice: 420, salePrice: 520, rack: 'C1', gstExempt: true },
    { name: 'Calpol Syrup 60ml', generic: 'Paracetamol', brand: 'GSK', category: 'Syrups', barcode: '8964000100067', purchasePrice: 55, salePrice: 75, rack: 'D1', gstExempt: false },
    { name: 'Risek 20mg', generic: 'Omeprazole', brand: 'Getz', category: 'Capsules', barcode: '8964000100074', purchasePrice: 95, salePrice: 140, rack: 'B2', gstExempt: true },
    { name: 'Flagyl 400mg', generic: 'Metronidazole', brand: 'Sanofi', category: 'Tablets', barcode: '8964000100081', purchasePrice: 70, salePrice: 100, rack: 'B3', gstExempt: false },
    { name: 'Dettol Antiseptic', generic: 'Chloroxylenol', brand: 'Reckitt', category: 'OTC', barcode: '8964000100098', purchasePrice: 180, salePrice: 250, rack: 'E1', gstExempt: false },
    { name: 'Polyfax Ointment', generic: 'Polymyxin B', brand: 'GSK', category: 'Creams', barcode: '8964000100104', purchasePrice: 95, salePrice: 130, rack: 'F1', gstExempt: false }
  ]

  for (const m of meds) {
    const id = await db.medicines.add({ ...m, branchId, supplierId: 1, createdAt: Date.now() })
    // Batch for each
    const exp = new Date()
    exp.setMonth(exp.getMonth() + 6 + Math.floor(Math.random() * 18))
    await db.batches.add({
      medicineId: id,
      batchNo: 'BN' + Math.floor(Math.random() * 90000 + 10000),
      expiry: exp.toISOString().slice(0, 10),
      qty: Math.floor(Math.random() * 80 + 20),
      purchasePrice: m.purchasePrice,
      branchId
    })
  }

  await db.suppliers.bulkAdd([
    { name: 'Muller & Phipps Pakistan', phone: '+92 42 111 000 111', address: 'Lahore' },
    { name: 'United Distributors', phone: '+92 42 111 000 222', address: 'Karachi' }
  ])

  await db.customers.bulkAdd([
    { name: 'Walk-in Customer', phone: '', credit: 0, branchId },
    { name: 'Ahmed Khan', phone: '+92 300 1112233', credit: 0, branchId }
  ])
}

export async function getSetting(key, fallback = null) {
  const row = await db.settings.get(key)
  return row ? row.value : fallback
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value })
}

export function nextInvoiceNo() {
  const now = new Date()
  const stamp = now.getFullYear().toString().slice(-2) +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0')
  return `MED-${stamp}-${uuid().slice(0, 6).toUpperCase()}`
}
