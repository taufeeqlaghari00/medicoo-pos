# Medicoo — Pharmacy POS System (Pakistan)

A complete offline-first, multi-branch Pharmacy POS built with **React + Vite + Tailwind + Dexie (IndexedDB)**.

Works 100% offline in the browser. When online, auto-sync is ready for future backend integration.

## ✨ Features

- 🛒 **POS Billing** — search by name/barcode/generic, cart, discounts, GST, multiple payments (Cash, JazzCash, Easypaisa, Bank, Udhaar)
- 🧾 **Thermal Receipts** — 80mm print-ready with NTN, STRN, pharmacy info
- 💊 **Inventory** — medicines, batches, expiry/stock alerts, categories, barcodes
- 📊 **Dashboard** — today's sales, revenue, low stock, near-expiry
- 💰 **Sales History** — filters, reprint, void with reason + auto stock restore
- 👥 **Customers & Udhaar** — credit tracking, payment collection
- 🚚 **Suppliers**
- 📈 **Reports** — top sellers, profit/loss, GST summary, expiry
- 🌐 **Bilingual** — English / اردو with live toggle + RTL
- 🏢 **Multi-Branch** — switch branches from topbar
- 📡 **Offline-First** — IndexedDB via Dexie; PWA-ready (installable)
- 🇵🇰 **Pakistan-Ready** — PKR formatting, GST 18%, DD/MM/YYYY dates

## 🚀 Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🏗️ Build

```bash
npm run build
npm run preview
```

## 📂 Structure

```
src/
├── components/
│   ├── layout/        # Sidebar, Topbar, Layout
│   └── billing/       # Receipt
├── context/           # AppContext (global state)
├── db/                # Dexie offline database + seed
├── i18n/              # EN/UR translations
├── pages/             # Dashboard, POS, Inventory, Sales, ...
└── utils/             # format helpers (PKR, date)
```

## 🔑 Default Data

On first run, seeds 10 common Pakistani medicines, 2 branches, 2 suppliers, Walk-in customer.

## 📝 Notes

- Data persists in browser IndexedDB — no server required
- Print preview uses `@media print` rules for 80mm receipts
- Ready to add a Node/Express sync backend later
