# Excel File Upload/Download Setup Guide

This guide explains how to set up the Excel file upload and download feature for different approval statuses.

## Features

The system now supports uploading and downloading Excel files for three approval stages:

1. **FFC/RSG Proposed** - For pending approvals (PendingWithFFC, PendingWithRSG, PendingWithRSGFFC statuses)
2. **RSG Assessed** - For approved items awaiting DVO (ApprovedAwaitingDVO status)
3. **DVO RR Approved** - For final approved items (DVORRIssued status)

## Setup Instructions

### 1. Database Migration

Run the migration to add file attachment columns to the database:

```bash
# Option 1: Using Prisma (preferred)
npm run db:migrate

# Option 2: Manual SQL migration (if Prisma is unavailable)
# Execute the SQL in prisma/add-file-attachments-migration.sql directly in your database
```

### 2. Supabase Storage Setup

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Create a new bucket named `vo-documents`
4. Set the bucket to **Public** (or configure RLS policies as needed)
5. Copy your **Supabase Anon Key** from Project Settings > API

### 3. Environment Variables

Add the following to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace `your_supabase_anon_key_here` with your actual Supabase anon key.

### 4. Storage Policies (Supabase)

In the Supabase dashboard, configure the following storage policies for the `vo-documents` bucket:

**INSERT Policy** (Allow authenticated uploads):
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vo-documents');
```

**SELECT Policy** (Allow public downloads):
```sql
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vo-documents');
```

**DELETE Policy** (Allow authenticated deletes):
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vo-documents');
```

## Usage

### Uploading Files

1. Navigate to the VO management page
2. Click on a VO row to expand it
3. In the **File Attachments** section, click **Upload File**
4. Select the file type (FFC/RSG Proposed, RSG Assessed, or DVO RR Approved)
5. Choose an Excel file (.xlsx or .xls)
6. Click **Upload**

### Downloading Files

1. Expand a VO row
2. In the **File Attachments** section, click the download icon next to any uploaded file
3. The file will be downloaded to your browser's default download location

## File Structure

Files are stored in Supabase Storage with the following structure:

```
vo-documents/
  └── {voId}/
      ├── ffcRsgProposed_{timestamp}.xlsx
      ├── rsgAssessed_{timestamp}.xlsx
      └── dvoRrApproved_{timestamp}.xlsx
```

## API Endpoints

- **POST /api/vo/upload** - Upload a file for a VO
  - Body: FormData with `file`, `fileType`, and `voId`
  - Returns: `{ success: true, fileUrl: string, vo: VO }`

## Troubleshooting

### Upload Fails with "Failed to upload file"

- Check that your Supabase anon key is correctly set in `.env`
- Verify the `vo-documents` bucket exists and is public
- Check browser console for detailed error messages

### Files Not Appearing After Upload

- Ensure the database migration has been run
- Check that React Query is invalidating properly (should refresh automatically)
- Try refreshing the page

### Download Links Not Working

- Verify the bucket is set to public in Supabase
- Check that the SELECT policy is configured correctly
- Ensure the file URL is properly formatted

## Security Considerations

- File uploads are restricted to authenticated admin users
- Only Excel files (.xlsx, .xls) are accepted
- Files are stored with unique timestamps to prevent overwriting
- Consider implementing file size limits in production
- Consider adding virus scanning for uploaded files in production

## Future Enhancements

Potential improvements for this feature:

- File size validation
- Virus scanning
- File versioning
- Automatic cleanup of old files
- Download tracking and analytics
- Support for additional file formats
