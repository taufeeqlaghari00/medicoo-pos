# Deploy Medicoo to Vercel

## 🚀 Method 1 — GitHub (easiest)

### Step 1: Push to GitHub
```bash
cd "C:\Users\Mekko Digital 18\POS syestem"
git init
git add .
git commit -m "Initial commit: Medicoo Pharmacy POS"
```

Create a new empty repo at https://github.com/new (name it `medicoo-pos`), then:
```bash
git remote add origin https://github.com/YOUR-USERNAME/medicoo-pos.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com and **sign in with GitHub**
2. Click **Add New… → Project**
3. Select your `medicoo-pos` repo → **Import**
4. Vercel auto-detects Vite — **leave defaults**
5. Click **Deploy** — takes ~60 seconds
6. You'll get a live URL like `https://medicoo-pos.vercel.app` 🎉

---

## ⚡ Method 2 — Vercel CLI

```bash
npm install -g vercel
cd "C:\Users\Mekko Digital 18\POS syestem"
vercel login
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? → your account
- Link to existing project? **N**
- Project name? `medicoo-pos`
- Directory? `./`
- Override settings? **N**

Done. For production:
```bash
vercel --prod
```

---

## 🔧 What's already configured

- ✅ `vercel.json` — SPA rewrites so routes like `/inventory` work after refresh
- ✅ Security headers (X-Frame-Options, Content-Type, Referrer-Policy)
- ✅ Cache headers for static assets
- ✅ Vite build config ready
- ✅ PWA manifest — users can "Install App" from browser

---

## 📝 Notes

- Data is stored in the browser's **IndexedDB** — each device keeps its own records
- Perfect for single-pharmacy-single-device setups
- Works 100% offline once loaded (PWA)
- Custom domain: Vercel dashboard → Settings → Domains
- Free tier is plenty — 100 GB bandwidth/month

---

## 🌐 After deploy

Open your Vercel URL on any device:
- Desktop → install as PWA via browser's install icon
- Android Chrome → "Add to Home Screen"
- iOS Safari → Share → Add to Home Screen

Your pharmacy can now run Medicoo from any browser, anywhere.
