# Deploy SamleyEduSuite to Vercel

## Prerequisites

- A [GitHub account](https://github.com) with your code pushed to a repository
- A [Vercel account](https://vercel.com) (free tier works)
- A [Supabase project](https://supabase.com) with the FAQ SQL run

---

## Step 1: Push Your Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2: Import Your Project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Vercel will auto-detect **Vite** — the settings should be:
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build` (or `vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
5. Click **"Deploy"** (it will fail the first time — that's OK, we need env vars next)

---

## Step 3: Add Environment Variables

1. In your Vercel project dashboard, go to **Settings → Environment Variables**
2. Add the following two variables:

| Name | Value | Environment |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-public-key` | Production, Preview, Development |

**Where to find these values:**
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to **Project Settings → API**
- Copy the **Project URL** and **anon public** key

3. Click **"Save"** after adding each variable

---

## Step 4: Redeploy

1. Go to the **Deployments** tab in your Vercel dashboard
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for the build to complete (~1–2 minutes)

---

## Step 5: Set Up Your Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Enter your domain (e.g., `samleyedusuite.com`)
3. Follow Vercel's instructions to configure DNS:
   - **Option A (Recommended):** Add a CNAME record pointing to `cname.vercel-dns.com`
   - **Option B:** Add A records pointing to Vercel's IP addresses (shown in dashboard)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Blank page on deploy | Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly |
| Build fails | Run `pnpm build` locally first to see the error |
| FAQ shows loading forever | Make sure you ran the `supabase-faq-migration.sql` in your Supabase SQL Editor |
| Styling issues | Clear browser cache and hard refresh (`Ctrl + Shift + R`) |

---

## Quick Commands Summary

```bash
# Install dependencies
pnpm install

# Run locally
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

---

## Auto-Deploys

Once connected, Vercel **auto-deploys** every time you push to `main`:
```bash
git add .
git commit -m "Your changes"
git push
# Vercel picks it up and deploys automatically!
```
