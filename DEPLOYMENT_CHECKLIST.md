# Deployment Checklist for Excel Upload/Download Feature

## Pre-Deployment Steps

### 1. Database Migration ✓

Run the database migration to add file attachment columns:

```bash
# Option 1: Using Prisma (recommended)
npm run db:migrate

# Option 2: Using the helper script
node run-migration.js

# Option 3: Manual SQL execution
# Connect to your Supabase database and run:
# prisma/add-file-attachments-migration.sql
```

**Verify migration success:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'variation_orders'
AND column_name IN ('ffcRsgProposedFile', 'rsgAssessedFile', 'dvoRrApprovedFile');
```

### 2. Supabase Storage Setup ✓

#### Step 2.1: Create Storage Bucket

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Bucket details:
   - **Name:** `vo-documents`
   - **Public bucket:** ✓ (checked)
   - Click **Create bucket**

#### Step 2.2: Configure Storage Policies

Navigate to **Storage** > **Policies** and add the following policies for the `vo-documents` bucket:

**Policy 1: Allow Authenticated Uploads**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vo-documents');
```

**Policy 2: Allow Public Downloads**
```sql
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vo-documents');
```

**Policy 3: Allow Authenticated Deletes**
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vo-documents');
```

#### Step 2.3: Get Supabase Anon Key

1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy the **anon/public** key under **Project API keys**
4. This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Environment Variables ✓

Add the following to your `.env` file (or deployment platform environment variables):

```env
# Supabase Storage
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Database (should already exist)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

**For Vercel/Production:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your key
4. Deploy or redeploy to apply changes

### 4. Install Dependencies ✓

Ensure all dependencies are installed:

```bash
npm install
```

This includes the newly added `@supabase/supabase-js` package.

### 5. Build Test ✓

Test that the application builds successfully:

```bash
npm run build
```

Fix any TypeScript or build errors before deployment.

## Deployment Steps

### Option A: Vercel Deployment

1. Commit and push all changes to your repository
2. Ensure environment variables are set in Vercel dashboard
3. Deploy via Vercel CLI or GitHub integration:
   ```bash
   vercel --prod
   ```

### Option B: Other Platforms

1. Set environment variables on your platform
2. Build the application:
   ```bash
   npm run build
   npm start
   ```

## Post-Deployment Verification

### 1. Verify File Upload Functionality

1. Log in as an admin user
2. Navigate to the VO management page
3. Expand a VO row
4. Click **Upload File** in the File Attachments section
5. Select a file type and upload an Excel file
6. Verify the upload completes successfully

### 2. Verify File Download Functionality

1. Find a VO with an uploaded file
2. Click the download icon next to the file
3. Verify the file downloads correctly

### 3. Verify Storage in Supabase

1. Go to Supabase dashboard > Storage > vo-documents
2. Verify uploaded files appear in the bucket
3. Check file paths follow pattern: `{voId}/{fileType}_{timestamp}.xlsx`

### 4. Test Different File Types

Upload files for each approval stage:
- FFC/RSG Proposed
- RSG Assessed
- DVO RR Approved

### 5. Check Error Handling

Test error scenarios:
- Upload non-Excel file (should show error)
- Upload without selecting file (should show error)
- Large file upload (check file size limits)

## Rollback Plan

If issues occur, rollback steps:

1. **Revert code changes:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Remove database columns (if needed):**
   ```sql
   ALTER TABLE variation_orders
   DROP COLUMN IF EXISTS "ffcRsgProposedFile",
   DROP COLUMN IF EXISTS "rsgAssessedFile",
   DROP COLUMN IF EXISTS "dvoRrApprovedFile";
   ```

3. **Remove Supabase bucket:**
   - Go to Supabase dashboard > Storage
   - Delete the `vo-documents` bucket

## Monitoring & Maintenance

### Things to Monitor

1. **Storage usage** - Monitor bucket size in Supabase
2. **Upload failures** - Check application logs for upload errors
3. **File access** - Monitor download patterns
4. **Database performance** - Check query performance with new columns

### Future Enhancements

Consider implementing:
- [ ] File size validation (max 10MB per file)
- [ ] Virus scanning for uploaded files
- [ ] File versioning (keep history of uploads)
- [ ] Automatic cleanup of old files
- [ ] Download tracking and analytics
- [ ] Support for additional file formats (PDF, Word, etc.)
- [ ] Bulk file upload
- [ ] File preview before download

## Troubleshooting

### Upload Fails with "Failed to upload file"

**Possible causes:**
1. Supabase anon key not set or incorrect
2. Storage bucket doesn't exist
3. Storage policies not configured
4. Network connectivity issues

**Solutions:**
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` in environment
- Check bucket exists and is named `vo-documents`
- Verify storage policies are active
- Check browser console for detailed errors

### Files Not Appearing After Upload

**Possible causes:**
1. Database update failed
2. React Query not invalidating cache
3. File uploaded but URL not saved

**Solutions:**
- Check application logs for database errors
- Refresh the page manually
- Verify file exists in Supabase Storage

### Download Links Not Working

**Possible causes:**
1. Bucket is not public
2. Storage SELECT policy missing
3. Invalid file URL format

**Solutions:**
- Set bucket to public in Supabase
- Add SELECT policy for public access
- Check file URL format in database

## Security Considerations

### Implemented Security Measures

- ✓ File type validation (Excel only)
- ✓ Admin-only upload access
- ✓ Authenticated uploads via Supabase
- ✓ Public read-only for downloads
- ✓ Unique filenames to prevent overwrites

### Recommended Additional Security

- [ ] Implement file size limits (10-50MB)
- [ ] Add virus/malware scanning
- [ ] Rate limiting on uploads
- [ ] Audit logging for file operations
- [ ] Implement file retention policies
- [ ] Add encryption at rest (Supabase provides this)
- [ ] CORS configuration for storage bucket

## Support

For issues or questions:
1. Check `FILE_UPLOAD_SETUP.md` for detailed setup instructions
2. Review application logs for errors
3. Check Supabase dashboard for storage issues
4. Contact development team

---

## Checklist Summary

Pre-Deployment:
- [ ] Database migration completed
- [ ] Supabase bucket created (`vo-documents`)
- [ ] Storage policies configured
- [ ] Environment variable added (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Dependencies installed
- [ ] Build test passed

Deployment:
- [ ] Code deployed to production
- [ ] Environment variables set in production

Post-Deployment:
- [ ] Upload functionality tested
- [ ] Download functionality tested
- [ ] Files visible in Supabase Storage
- [ ] All three file types tested
- [ ] Error handling verified

**Date Completed:** _______________
**Deployed By:** _______________
**Verified By:** _______________
