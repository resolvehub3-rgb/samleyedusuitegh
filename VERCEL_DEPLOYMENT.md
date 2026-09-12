# SamleyEduSuite Vercel Production Deployment Guide

This guide explains how to deploy SamleyEduSuite to Vercel for production.

## Project Overview

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Hosting**: Vercel (static SPA hosting)

---

## PREREQUISITES

1. **GitHub Repository**: Push the code to GitHub
2. **Vercel Account**: Create at [vercel.com](https://vercel.com)
3. **Supabase Project**: You need an existing Supabase project with the schema already applied

---

## STEP 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel production deployment"
git push origin main
```

---

## STEP 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect:
   - Framework: **Vite** (or select "Other" if needed)
   - Build Command: `npm run build`
   - Output Directory: `dist`

---

## STEP 3: Configure Environment Variables

In Vercel Dashboard, go to **Project Settings > Environment Variables** and add:

### Production Variables (add to "Production" environment):

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | From Supabase Dashboard > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | From Supabase Dashboard > Project Settings > API |

### Preview Variables (add to "Preview" environment):

Use the same values as production, or point to a separate staging Supabase project if you have one.

### Development Variables (for local development):

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

---

## STEP 4: Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete (should take ~30 seconds)
3. Once deployed, you'll get a URL like: `https://samleyedusuite.vercel.app`

---

## STEP 5: Configure Supabase Authentication

After deployment, you MUST configure Supabase Auth to recognize the Vercel URL:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel production URL:
   ```
   https://samleyedusuite.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://samleyedusuite.vercel.app/**
   ```
   Or more specifically:
   ```
   https://samleyedusuite.vercel.app/auth/callback
   ```

---

## STEP 6: Verify Deployment

Test the following in your production Vercel URL:

- [ ] Landing page loads at `/`
- [ ] Login page loads at `/login`
- [ ] Registration page loads at `/register`
- [ ] Super Admin login works at `/super-admin`
- [ ] School Admin can log in
- [ ] Teacher can log in
- [ ] Parent can log in
- [ ] Dashboard loads after login
- [ ] Navigation works correctly
- [ ] Realtime notifications appear
- [ ] Payment submission works
- [ ] Subscription status shows correctly
- [ ] Print functionality works (report cards)

---

## STEP 7: Test Direct Navigation (SPA Routing)

Vercel is configured to handle SPA routing. Test by directly opening these URLs:

- `https://samleyedusuite.vercel.app/`
- `https://samleyedusuite.vercel.app/login`
- `https://samleyedusuite.vercel.app/register`
- `https://samleyedusuite.vercel.app/super-admin`
- `https://samleyedusuite.vercel.app/school/your-school-slug`
- `https://samleyedusuite.vercel.app/school/your-school-slug/teacher/login`
- `https://samleyedusuite.vercel.app/parent`
- `https://samleyedusuite.vercel.app/teacher`

All should work without 404 errors.

---

## Future: Custom Domain from Aveshost

When you purchase your custom domain from Aveshost:

### 1. Add Domain in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click **Add** and enter your domain (e.g., `samleyedusuite.com`)
3. Vercel will show you the DNS records to configure

### 2. Configure DNS in Aveshost

In **Aveshost DNS Management**, add the records Vercel shows you (typically):
- **A records** pointing to Vercel's IP addresses
- **CNAME** for `www` subdomain

### 3. Verify Domain

1. Wait for DNS propagation (can take up to 24 hours, usually faster)
2. Vercel will automatically verify the domain
3. Set the custom domain as the **Production Domain**

### 4. Update Supabase

After the custom domain is working:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Update **Site URL** to your custom domain:
   ```
   https://samleyedusuite.com
   ```
3. Add custom domain to **Redirect URLs**:
   ```
   https://samleyedusuite.com/**
   ```

### 5. Test Everything

- [ ] Login/logout works
- [ ] Password reset works
- [ ] All routes work
- [ ] Subscription/payment flows work
- [ ] HTTPS/SSL is active (Vercel provides this automatically)

---

## Security Notes

### What's Safe for Client-Side

- `VITE_SUPABASE_URL` - Public project URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key (works with RLS)

### What NEVER Goes in Client Code

- `SUPABASE_SERVICE_ROLE_KEY` - Never expose this
- Database passwords
- Private API keys
- SMTP passwords
- Secret tokens

### Row Level Security (RLS)

All data access is protected by Supabase RLS policies. The frontend uses the anon key which respects all RLS rules. This means:

- School Admins can only access their own school's data
- Teachers can only access their assigned classes
- Parents can only access their linked children's data
- Super Admins have platform-wide access (enforced by RLS function)

---

## Environment Variables Summary

### Required in Vercel (Production & Preview)

```
VITE_SUPABASE_URL = "https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Local Development (.env.local)

```
VITE_SUPABASE_URL = "https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Files Changed for Deployment

- `.env.example` - Updated with correct variable documentation
- `.gitignore` - Ensured secret files are excluded
- `vercel.json` - Added SPA routing configuration
- `VERCEL_DEPLOYMENT.md` - This documentation

---

## Troubleshooting

### Build Fails

1. Check that `package.json` has correct scripts
2. Verify `pnpm-lock.yaml` is committed
3. Ensure Node.js version is compatible (v18+)

### Authentication Fails

1. Verify Supabase URL and Anon Key are correct
2. Check Supabase Auth Site URL is configured
3. Check browser console for Supabase errors

### 404 on Refresh

The `vercel.json` should handle this. If not:
1. Verify `vercel.json` is in the root directory
2. Try redeploying

### Realtime Not Working

1. Check Supabase project has Realtime enabled
2. Verify RLS policies allow realtime subscriptions
3. Check browser console for WebSocket errors

---

## Support

For issues:
- Check browser console (F12)
- Check Vercel deploy logs
- Check Supabase logs in Supabase Dashboard
