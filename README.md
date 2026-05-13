# 🌿 Habitly — Habit Tracker

Clean, minimal habit tracker. Next.js + Supabase + PWA.

---

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
File `.env.local` sudah ada. Cek isinya:
```
NEXT_PUBLIC_SUPABASE_URL=https://duhzgxwoduelmaixjhul.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

### 3. Setup Supabase database
- Buka Supabase Dashboard → SQL Editor
- Copy isi file `supabase/schema.sql`
- Jalankan (klik Run)

### 4. Enable Email Auth di Supabase
- Supabase Dashboard → Authentication → Providers → Email → Enable

### 5. Jalankan dev server
```bash
npm run dev
```

---

## 📦 Deploy ke Vercel

1. Push project ke GitHub
2. Import di vercel.com
3. Tambah environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### ⚠️ Tambah Vercel domain ke Supabase
Setelah deploy, buka:
Supabase → Authentication → URL Configuration → Site URL → isi URL Vercel kamu

---

## 📱 Install sebagai PWA

Di mobile Chrome/Safari:
- Chrome: Menu → "Add to Home Screen"
- Safari: Share → "Add to Home Screen"

### Generate ikon PWA
Kamu perlu buat ikon di folder `public/icons/`:
- icon-72x72.png, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Tool gratis: https://realfavicongenerator.net

---

## 🔒 Security Note
- **JANGAN** commit `.env.local` ke GitHub
- Secret key hanya untuk server-side (tidak dipakai di app ini)
- Semua data diproteksi dengan Row Level Security (RLS) di Supabase

---

## 🌿 Fitur

- ✅ Dashboard dengan progress harian
- ✅ Week calendar (7 hari terakhir)  
- ✅ CRUD habits dengan icon & warna
- ✅ Check-in per hari
- ✅ Streak tracking
- ✅ Statistik & heatmap 30 hari
- ✅ Kategori custom
- ✅ Profil pengguna
- ✅ PWA (installable)
- ✅ Auth (login/register)
