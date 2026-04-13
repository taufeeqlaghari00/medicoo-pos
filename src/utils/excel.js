import * as XLSX from 'xlsx'
import { db } from '../db/database.js'

export async function exportInventoryToExcel(branchId) {
  const meds = await db.medicines.filter(m => m.branchId === branchId).toArray()
  const batches = await db.batches.filter(b => b.branchId === branchId).toArray()

  const rows = meds.map(m => {
    const mBatches = batches.filter(b => b.medicineId === m.id)
    const stock = mBatches.reduce((a, b) => a + b.qty, 0)
    const exp = mBatches.sort((a, z) => new Date(a.expiry) - new Date(z.expiry))[0]
    return {
      Name: m.name,
      Generic: m.generic || '',
      Brand: m.brand || '',
      Category: m.category || '',
      Barcode: m.barcode || '',
      PurchasePrice: m.purchasePrice || 0,
      SalePrice: m.salePrice || 0,
      Stock: stock,
      Rack: m.rack || '',
      'BatchNo': exp?.batchNo || '',
      Expiry: exp?.expiry || '',
      GSTExempt: m.gstExempt ? 'Yes' : 'No'
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory')

  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `medicoo_inventory_${stamp}.xlsx`)
}

export async function importInventoryFromExcel(file, branchId) {
  const data = await file.arrayBuffer()
  const wb = XLSX.read(data)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet)

  let added = 0
  for (const r of rows) {
    if (!r.Name) continue
    const medId = await db.medicines.add({
      name: r.Name,
      generic: r.Generic || '',
      brand: r.Brand || '',
      category: r.Category || 'Tablets',
      barcode: String(r.Barcode || ''),
      purchasePrice: Number(r.PurchasePrice || 0),
      salePrice: Number(r.SalePrice || 0),
      rack: r.Rack || '',
      gstExempt: String(r.GSTExempt || '').toLowerCase() === 'yes',
      supplierId: 1,
      branchId,
      createdAt: Date.now()
    })
    if (Number(r.Stock) > 0) {
      await db.batches.add({
        medicineId: medId,
        batchNo: r.BatchNo || 'IMPORT-' + Date.now(),
        expiry: r.Expiry || '',
        qty: Number(r.Stock),
        purchasePrice: Number(r.PurchasePrice || 0),
        branchId
      })
    }
    added++
  }
  return added
}

export function downloadTemplate() {
  const sample = [{
    Name: 'Panadol Extra',
    Generic: 'Paracetamol+Caffeine',
    Brand: 'GSK',
    Category: 'Tablets',
    Barcode: '8964000100012',
    PurchasePrice: 18,
    SalePrice: 25,
    Stock: 50,
    Rack: 'A1',
    BatchNo: 'BN12345',
    Expiry: '2027-06-30',
    GSTExempt: 'No'
  }]
  const ws = XLSX.utils.json_to_sheet(sample)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, 'medicoo_import_template.xlsx')
}
