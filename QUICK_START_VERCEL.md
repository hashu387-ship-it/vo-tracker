# Quick Start: Deploy to Vercel

**Time required:** 15-20 minutes

## Prerequisites Check

- [ ] GitHub account
- [ ] Vercel account (create free at https://vercel.com)
- [ ] Supabase project (you already have this)
- [ ] Repository pushed to GitHub

## 🚀 Fast Track Deployment (3 Steps)

### Step 1: Merge to Main Branch (5 min)

First, merge your feature branch to main:

```bash
# Create and view PR URL
cat PR_DETAILS.md

# Or merge locally:
git checkout main
git pull origin main
git merge claude/excel-upload-download-approvals-Kqmjt
git push origin main
```

### Step 2: Deploy to Vercel (5 min)

**Option A: Via Dashboard (Easier)**

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select `hashu387-ship-it/vo-tracker`
4. Click **Import**
5. Project will auto-detect as Next.js ✓
6. Click **Deploy** (don't add env vars yet)
7. Wait for initial deployment to complete

**Option B: Via CLI**

```bash
# From main branch:
./deploy-vercel.sh

# Or manually:
npx vercel --prod
```

### Step 3: Add Environment Variables (5 min)

1. Go to https://vercel.com/[your-username]/vo-tracker/settings/environment-variables

2. Add these variables **(copy from `.env.vercel.template`)**:

   | Variable | Where to Get It |
   |----------|----------------|
   | `DATABASE_URL` | Already in template ✓ |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon key |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Already in template ✓ |
   | `CLERK_SECRET_KEY` | Already in template ✓ |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |

3. For each variable:
   - Click **Add New**
   - Paste name and value
   - Select **Production**, **Preview**, **Development**
   - Click **Save**

4. **Redeploy** after adding variables:
   - Go to Deployments tab
   - Click ⋯ menu on latest deployment
   - Click **Redeploy**

## 🎯 Post-Deployment Setup (10 min)

### 1. Get Your Supabase Anon Key

If you haven't already added it:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** (⚙️) > **API**
4. Copy the **anon/public** key
5. Add as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
6. Redeploy

### 2. Create Supabase Storage Bucket

1. Supabase Dashboard > **Storage**
2. Click **New bucket**
3. Name: `vo-documents`
4. **Public bucket:** ✓ (checked)
5. Click **Create**

### 3. Add Storage Policies

In Supabase Dashboard > Storage > Policies:

```sql
-- Copy and run each policy:

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vo-documents');

CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vo-documents');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vo-documents');
```

### 4. Run Database Migration

Your database needs the new file attachment columns:

```bash
# From your local machine:
node run-migration.js
```

**OR** in Supabase Dashboard > SQL Editor:

```sql
ALTER TABLE variation_orders
ADD COLUMN IF NOT EXISTS "ffcRsgProposedFile" TEXT,
ADD COLUMN IF NOT EXISTS "rsgAssessedFile" TEXT,
ADD COLUMN IF NOT EXISTS "dvoRrApprovedFile" TEXT;
```

### 5. Update Clerk Settings

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Configure** > **Paths**
4. Update URLs to your Vercel URL:
   - Home URL: `https://your-app.vercel.app`
   - After sign-in: `https://your-app.vercel.app/dashboard`
   - After sign-up: `https://your-app.vercel.app/dashboard`
5. Go to **Configure** > **Domains**
6. Add: `your-app.vercel.app`

## ✅ Verification (5 min)

Visit your deployed app and test:

1. **Authentication:**
   - [ ] Can sign in
   - [ ] Redirects to dashboard

2. **Dashboard:**
   - [ ] VOs load correctly
   - [ ] Data displays properly

3. **File Upload:**
   - [ ] Expand a VO row
   - [ ] Click "Upload File"
   - [ ] Upload an Excel file
   - [ ] Success message appears

4. **File Download:**
   - [ ] Download icon appears for uploaded files
   - [ ] Click download
   - [ ] File downloads successfully

## 🐛 Troubleshooting

### "Deployment failed to build"
- Check Vercel build logs
- Ensure all dependencies in package.json
- Verify DATABASE_URL is set

### "Cannot upload files"
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel
- Check Supabase bucket exists and is public
- Verify storage policies are active

### "Database connection error"
- Verify `DATABASE_URL` is correct in Vercel
- Check Supabase database is running
- Ensure database migration was run

## 📚 Full Documentation

For detailed information:
- **VERCEL_DEPLOYMENT.md** - Complete deployment guide
- **FILE_UPLOAD_SETUP.md** - File upload feature setup
- **DEPLOYMENT_CHECKLIST.md** - Comprehensive deployment checklist

## 🎉 You're Done!

Your VO Tracker app is now live on Vercel with full Excel upload/download functionality!

**Your deployment URL:** `https://your-app-name.vercel.app`

---

Need help? Check the troubleshooting section or review the full documentation.
