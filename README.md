# Suspect Visitor Management System (SVS)

**Ethiopia Federal Police — Crime Investigation Bureau**

A bilingual (Amharic / English) web application for managing suspect visits at the Ethiopia Federal Police Crime Investigation Bureau.

---

## Features

### Admin (desktop)
- Login with admin account
- Add suspects (name, gender, notes) — default status: Not Here
- View suspect list with search, gender filter, status filter
- Update suspect status per row: **At Court / Released / Transferred / Not Here**
- Full visit history: visitor name, suspect name, QR data, ticket number, timestamps, validity status

### Visitor (mobile)
- Sign up / login with phone + password
- Choose gender filter (Man / Woman)
- Browse and search suspect list
- Select a suspect → scan any QR code with phone camera
- Visit recorded to live database instantly (admin sees it immediately)
- Ticket generated: unique number, 30-minute countdown, suspect + visitor name
- Ticket displayed on phone with live countdown timer

### General
- Bilingual: English ↔ Amharic toggle, persisted in localStorage
- Police-themed UI (deep navy + gold, coat-of-arms logo)
- Deployed free on Vercel + Supabase

---

## Local Development

### 1. Prerequisites
- Node.js 18+
- A Supabase project (free tier at [supabase.com](https://supabase.com))

### 2. Clone and install
```bash
git clone <your-repo-url>
cd svs
npm install
```

### 3. Set environment variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Find these in your Supabase project: **Settings → API**.

### 4. Run the database migration
In your Supabase dashboard go to **SQL Editor → New Query**, paste the contents of `supabase/migration.sql`, and click **Run**.

### 5. Create your first admin account
1. Open the app (`npm run dev` → http://localhost:3000) and sign up normally.
2. In Supabase **SQL Editor**, promote your account to admin:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE phone = '0911xxxxxx';   -- use the phone number you signed up with
```

### 6. Start dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

> ⚠️ **QR camera requires HTTPS.** On local dev, Chrome allows `localhost` without HTTPS. For testing on a real phone locally, use `ngrok` or deploy to Vercel.

---

## Supabase Setup (Step-by-Step)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier).
2. Note your **Project URL** and **anon public key** from **Settings → API**.
3. Also note the **service_role** key (keep this secret, server-side only).
4. Go to **SQL Editor → New query**, paste `supabase/migration.sql`, and run it.
5. This creates the `profiles`, `suspects`, and `visits` tables with Row Level Security policies.
6. Enable **Email/Password** auth: **Authentication → Providers → Email** (on by default).

---

## Vercel Deployment (Free Tier)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial SVS commit"
git remote add origin https://github.com/your-username/svs.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**.
2. Import your GitHub repository.
3. Framework preset: **Next.js** (auto-detected).

### Step 3 — Set Environment Variables in Vercel
In the Vercel project settings → **Environment Variables**, add:

| Variable | Value | Where to get |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase → Settings → API → service_role (**secret**) |

### Step 4 — Deploy
Click **Deploy**. Vercel builds and deploys automatically.

### Step 5 — After deployment
- Your app URL: `https://your-project.vercel.app`
- **Camera/QR scanning works automatically** — Vercel provides HTTPS by default, which is required for browser camera access.
- Sign up for a visitor account, then promote it to admin in Supabase SQL Editor.

---

## QR Camera — HTTPS Requirement

> The browser `getUserMedia` API (used by `html5-qrcode`) **requires a secure context (HTTPS)**.
> - ✅ Vercel deployment: HTTPS by default — camera works out of the box.
> - ✅ `localhost` in Chrome/Firefox: treated as secure context — works in local dev.
> - ❌ Plain HTTP on a non-localhost URL: camera will be blocked by the browser.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| Styling | Tailwind CSS |
| QR Scanning | html5-qrcode |
| i18n | Custom React Context (Amharic + English) |
| Deployment | Vercel (free) + Supabase (free) |

---

## Project Structure

```
svs/
├── app/
│   ├── layout.tsx          # Root layout + LanguageProvider
│   ├── page.tsx            # Root redirect (→ admin or visitor)
│   ├── login/              # Login page
│   ├── signup/             # Visitor signup
│   ├── admin/              # Admin panel (desktop)
│   │   ├── layout.tsx      # Admin layout + auth guard (role=admin)
│   │   ├── page.tsx        # Dashboard with live stats
│   │   ├── suspects/       # Suspect list + status update
│   │   │   └── add/        # Add suspect form
│   │   └── visits/         # Full visit history
│   └── visitor/            # Visitor flow (mobile)
│       ├── layout.tsx      # Visitor layout + auth guard
│       ├── page.tsx        # Gender select (Man / Woman)
│       ├── suspects/       # Browse + search suspects
│       └── scan/[id]/      # QR scanner + ticket display
├── components/
│   ├── Header.tsx          # Police header + language toggle + logout
│   ├── Footer.tsx          # Official footer
│   ├── AdminSidebar.tsx    # Admin navigation
│   ├── LanguageToggle.tsx  # EN / አማ toggle
│   ├── QrScanner.tsx       # html5-qrcode wrapper
│   └── Ticket.tsx          # 30-min countdown ticket card
├── lib/
│   ├── i18n/               # Translations (Amharic + English) + provider
│   ├── supabase/           # Browser + server Supabase clients
│   └── types.ts            # Shared TypeScript types
├── supabase/
│   └── migration.sql       # DB schema + RLS policies
├── public/
│   ├── logo.png            # Federal Police coat of arms
│   └── logo-bg.png         # Transparent variant
└── .env.example            # Required env vars template
```
