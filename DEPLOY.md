# CarsIgnite — Deployment Guide

## Architecture
```
GitHub Repo (monorepo)
├── / (root)          → Railway (Express API + SQLite)
└── /frontend         → Vercel (Next.js)
```

## Step 1: Initialize Git

```bash
cd ~/Desktop/carsignite
git init
git add .
git commit -m "CarsIgnite v1 — Full-stack supercar community platform"
```

## Step 2: Create GitHub Repo

1. Go to https://github.com/new
2. Create repo: `carsignite` (private)
3. Push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/carsignite.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend on Railway

1. Go to https://railway.app → New Project → Deploy from GitHub Repo
2. Select your `carsignite` repo
3. Railway auto-detects Node.js from root `package.json`

### Add a Persistent Volume (for SQLite DB):
1. In your Railway service → Settings → Volumes
2. Add Volume: Mount Path = `/data`
3. This persists your SQLite DB across deploys

### Set Environment Variables:
In Railway → Service → Variables, add:

```
PORT=3000
NODE_ENV=production
DB_PATH=/data/carsignite.db
JWT_SECRET=generate-a-64-char-random-string-here
ADMIN_EMAIL=admin@carsignite.co.za
ADMIN_PASSWORD=your-secure-admin-password
FRONTEND_URL=https://carsignite.vercel.app

# PayFast (Sandbox first, then swap to production)
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=
PAYFAST_URL=https://sandbox.payfast.co.za/eng/process
PAYFAST_VALIDATE_URL=https://sandbox.payfast.co.za/eng/query/validate
PAYFAST_RETURN_URL=https://carsignite.vercel.app/payment/success
PAYFAST_CANCEL_URL=https://carsignite.vercel.app/payment/cancel
PAYFAST_NOTIFY_URL=https://YOUR-APP.up.railway.app/api/payfast/notify

# Optional
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

4. Note your Railway public URL (e.g. `https://carsignite-production.up.railway.app`)

---

## Step 4: Deploy Frontend on Vercel

1. Go to https://vercel.com → Add New Project → Import from GitHub
2. Select your `carsignite` repo
3. **IMPORTANT**: Set Root Directory to `frontend`
4. Framework Preset: Next.js (auto-detected)

### Set Environment Variables:
In Vercel → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://YOUR-APP.up.railway.app
```

Replace with your actual Railway URL from Step 3.

5. Deploy!

---

## Step 5: Update Railway with Vercel URL

Once Vercel gives you a URL (e.g. `https://carsignite.vercel.app`):

1. Go back to Railway → Variables
2. Update `FRONTEND_URL` to your actual Vercel URL
3. Update all `PAYFAST_RETURN_URL` and `PAYFAST_CANCEL_URL` with the Vercel URL

---

## Step 6: Custom Domain (Optional)

### Vercel (frontend):
1. Vercel → Project → Settings → Domains
2. Add `app.carsignite.co.za` or `carsignite.co.za`
3. Update DNS: CNAME → `cname.vercel-dns.com`

### Railway (backend):
1. Railway → Service → Settings → Networking → Custom Domain
2. Add `api.carsignite.co.za`
3. Update DNS as instructed

Then update env vars:
- Vercel: `NEXT_PUBLIC_API_URL=https://api.carsignite.co.za`
- Railway: `FRONTEND_URL=https://app.carsignite.co.za`
- Railway: PayFast URLs with the new domains

---

## Going Live with PayFast

1. Create a live PayFast merchant account at https://payfast.io
2. Enable "Recurring Billing" in PayFast Dashboard → Settings
3. Update Railway env vars:
```
PAYFAST_MERCHANT_ID=your-live-id
PAYFAST_MERCHANT_KEY=your-live-key
PAYFAST_PASSPHRASE=your-live-passphrase
PAYFAST_URL=https://www.payfast.co.za/eng/process
PAYFAST_VALIDATE_URL=https://www.payfast.co.za/eng/query/validate
```

---

## Troubleshooting

**Railway SQLite "database is locked":**
→ Make sure you added a volume at `/data` and set `DB_PATH=/data/carsignite.db`

**Vercel API calls fail:**
→ Check `NEXT_PUBLIC_API_URL` is set correctly (no trailing slash)
→ Check Railway CORS has `FRONTEND_URL` set to your Vercel domain

**PayFast ITN not hitting:**
→ `PAYFAST_NOTIFY_URL` must be your Railway public URL (not Vercel)
→ PayFast can't reach localhost — use ngrok for local testing
