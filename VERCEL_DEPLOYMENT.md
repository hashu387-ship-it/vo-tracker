# Vercel Deployment Guide

This guide will help you deploy the VO Tracker application to Vercel with full Excel upload/download functionality.

## Prerequisites

- GitHub repository connected to your account
- Vercel account (free tier works)
- Supabase project set up
- Database migration completed

## Step 1: Prepare Environment Variables

You'll need the following environment variables for Vercel:

### Required Variables

```env
# Database Connection
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Supabase Storage (for file uploads)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### How to Get These Values

**DATABASE_URL:**
1. Go to Supabase Dashboard > Project Settings > Database
2. Copy the "Connection string" under "Connection pooling"
3. Replace `[YOUR-PASSWORD]` with your actual database password

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
1. Go to Supabase Dashboard > Project Settings > API
2. Copy the "anon/public" key under "Project API keys"

**Clerk Keys:**
1. Go to Clerk Dashboard > API Keys
2. Copy both the Publishable Key and Secret Key

## Step 2: Deploy via Vercel Dashboard

### Option A: Import from GitHub (Recommended)

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `vo-tracker` repository
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./ (leave as default)
   - **Build Command:** Already configured in vercel.json
   - **Output Directory:** .next (default)

5. **Add Environment Variables:**
   - Click **Environment Variables**
   - Add each variable from the list above:
     - Enter variable name (e.g., `DATABASE_URL`)
     - Enter value
     - Select environment: **Production, Preview, and Development**
     - Click **Add**

6. Click **Deploy**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project directory:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy: **Yes**
   - Which scope: Select your account
   - Link to existing project: **No** (or Yes if updating)
   - Project name: `vo-tracker` (or your preferred name)
   - Directory: `.`
   - Override settings: **No**

5. Add environment variables via CLI:
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
   vercel env add CLERK_SECRET_KEY production
   # Add remaining variables...
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Post-Deployment Setup

### 3.1: Run Database Migration

The database migration needs to be run manually since Vercel deployments are stateless.

**Option 1: Local Migration**
```bash
# Make sure your DATABASE_URL is set locally
node run-migration.js
```

**Option 2: Direct SQL Execution**
1. Go to Supabase Dashboard > SQL Editor
2. Open the migration file: `prisma/add-file-attachments-migration.sql`
3. Copy and paste the SQL
4. Click **Run**

### 3.2: Configure Supabase Storage

If you haven't already set up the storage bucket:

1. **Create Bucket:**
   - Go to Supabase Dashboard > Storage
   - Click **Create a new bucket**
   - Name: `vo-documents`
   - Public: ✓ (checked)
   - Click **Create**

2. **Set Storage Policies:**
   Go to Storage > Policies and add these policies:

   ```sql
   -- Allow authenticated uploads
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'vo-documents');

   -- Allow public downloads
   CREATE POLICY "Allow public downloads"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'vo-documents');

   -- Allow authenticated deletes
   CREATE POLICY "Allow authenticated deletes"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'vo-documents');
   ```

### 3.3: Update Clerk Settings

1. Go to Clerk Dashboard > Configure > Paths
2. Update the following URLs with your Vercel deployment URL:
   - **Sign-in URL:** `https://your-app.vercel.app/sign-in`
   - **Sign-up URL:** `https://your-app.vercel.app/sign-up`
   - **After sign-in URL:** `https://your-app.vercel.app/dashboard`
   - **After sign-up URL:** `https://your-app.vercel.app/dashboard`

3. Add your Vercel domain to allowed origins:
   - Go to Clerk Dashboard > Configure > Domains
   - Add: `your-app.vercel.app`

## Step 4: Verify Deployment

### 4.1: Check Build Logs

1. Go to Vercel Dashboard > Your Project > Deployments
2. Click on the latest deployment
3. Check the **Build Logs** tab for any errors
4. Verify "Completed" status

### 4.2: Test the Application

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test authentication (sign in)
3. Navigate to the VO management page
4. Test file upload functionality:
   - Expand a VO row
   - Click "Upload File"
   - Upload an Excel file
   - Verify successful upload
5. Test file download functionality:
   - Click download icon on an uploaded file
   - Verify file downloads correctly

### 4.3: Monitor for Errors

Check Vercel logs for any runtime errors:
```bash
vercel logs
```

Or view logs in the Vercel Dashboard > Your Project > Logs

## Environment Variable Reference

### Complete List for Copy-Paste

When adding to Vercel, use these exact names:

| Variable Name | Required | Description |
|--------------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key for file storage |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key for authentication |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key for server-side auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | Path to sign-in page (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | Path to sign-up page (`/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | Redirect after sign-in (`/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | Redirect after sign-up (`/dashboard`) |

### How to Add via Vercel Dashboard

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. For each variable:
   - Click **Add New**
   - Name: Enter the exact variable name
   - Value: Paste the value
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

## Troubleshooting

### Build Fails with "Prisma generate failed"

**Solution:** Ensure `DATABASE_URL` is set in environment variables.

```bash
# Check if DATABASE_URL is set
vercel env ls
```

### "Failed to fetch font DM Sans" Error

This is a network issue during build. The build should retry automatically.

**If it persists:**
- Redeploy: `vercel --prod --force`
- Check Vercel status: https://vercel-status.com

### File Upload Returns 403 Error

**Possible causes:**
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set or incorrect
2. Supabase bucket doesn't exist
3. Storage policies not configured

**Solution:**
- Verify environment variable in Vercel settings
- Check Supabase Storage bucket exists and is public
- Verify storage policies are active

### Database Connection Errors

**Symptoms:** "Cannot connect to database" or similar errors

**Solution:**
1. Verify `DATABASE_URL` is correct in Vercel
2. Check Supabase database is running
3. Verify database password is correct (URL-encoded if it contains special characters)

### File Downloads Return 404

**Solution:**
1. Check bucket is set to public in Supabase
2. Verify SELECT policy exists
3. Check file URLs in database are correct

## Updating the Deployment

### Update Code

1. Push changes to GitHub:
   ```bash
   git push origin main
   ```

2. Vercel will automatically deploy the update

### Update Environment Variables

1. Go to Vercel Dashboard > Settings > Environment Variables
2. Click on the variable to edit
3. Update the value
4. **Redeploy** for changes to take effect:
   ```bash
   vercel --prod
   ```
   Or trigger a redeploy from Vercel Dashboard

## Custom Domain Setup (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Click **Add Domain**
3. Enter your custom domain
4. Follow the DNS configuration instructions
5. Update Clerk allowed domains with your custom domain

## Performance Optimization

### Enable Vercel Analytics (Optional)

1. Go to Vercel Dashboard > Your Project > Analytics
2. Click **Enable Analytics**
3. Follow the setup instructions

### Configure ISR (Incremental Static Regeneration)

The application already uses server-side rendering for dynamic data.
No additional ISR configuration needed for this project.

## Security Checklist

- [ ] All environment variables set in Vercel
- [ ] Database credentials not exposed in client-side code
- [ ] Supabase anon key is public-safe (designed for client-side use)
- [ ] Clerk authentication properly configured
- [ ] Storage bucket policies restrict uploads to authenticated users
- [ ] HTTPS enabled by default on Vercel

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# List environment variables
vercel env ls

# Remove a deployment
vercel rm <deployment-url>

# Link local project to Vercel project
vercel link

# Pull environment variables locally
vercel env pull .env.local
```

## Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Docs:** https://supabase.com/docs
- **Clerk Docs:** https://clerk.com/docs

## Deployment Checklist

Before going live, ensure:

- [ ] All environment variables added to Vercel
- [ ] Database migration completed
- [ ] Supabase storage bucket created and configured
- [ ] Storage policies added
- [ ] Clerk domain settings updated
- [ ] Application deploys successfully
- [ ] Authentication works
- [ ] File upload works
- [ ] File download works
- [ ] No errors in Vercel logs
- [ ] Custom domain configured (if applicable)

---

**Last Updated:** December 2024
**Vercel Region:** US East (iad1)
**Framework:** Next.js 14.2.18
