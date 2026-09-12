# How to Fix Vercel Deployment for SamleyEduSuite

## Quick Fix Steps

### 1. Configure Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these two variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key (from Supabase Dashboard > API) |

**Important:** Set these for both **Production** and **Preview** environments.

---

### 2. Configure Supabase Auth URLs

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**

Set **Site URL** to your Vercel domain:
```
https://your-project.vercel.app
```

Add to **Redirect URLs**:
```
https://your-project.vercel.app/**
```

---

### 3. Verify vercel.json Exists

Ensure `vercel.json` exists in your project root with this content:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static",
      "config": { "pages": "legacy" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

This enables SPA routing so direct URL navigation works.

---

### 4. Redeploy

After adding environment variables:

1. Go to **Vercel Dashboard** → Your Project
2. Click **Redeploy** (or push a new commit to trigger deploy)
3. Wait for deployment to complete

---

### Common Issues & Fixes

#### Issue: 404 on page refresh
**Fix:** Ensure `vercel.json` is in project root with SPA rewrite rules.

#### Issue: Login redirects fail
**Fix:** Add Vercel URL to Supabase Authentication > URL Configuration > Redirect URLs.

#### Issue: "Supabase not configured" message
**Fix:** Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in Vercel environment variables.

#### Issue: Build fails
**Fix:** Check Vercel deploy logs. Ensure `package.json` has `"build": "vite build"` script.

#### Issue: Can't access /login, /register directly
**Fix:** The `vercel.json` rewrite rule should handle this. Redeploy after adding it.

---

### Test After Deployment

Open your Vercel URL and verify:

- [ ] `https://your-project.vercel.app/` - Landing page
- [ ] `https://your-project.vercel.app/login` - Login page
- [ ] `https://your-project.vercel.app/register` - Registration page
- [ ] Login works with Supabase Auth
- [ ] Dashboard loads after login
- [ ] Navigation works (no 404 on refresh)

---

### Need Help?

Check **Vercel Deploy Logs** for errors, or check browser console (F12) for Supabase connection errors.
