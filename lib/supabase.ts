import { createClient } from '@supabase/supabase-js';

// Extract Supabase project reference from DATABASE_URL
// Handles both formats:
// - Standard: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
// - Pooler: postgresql://postgres.xxx:password@aws-region.pooler.supabase.com:6543/postgres
const databaseUrl = process.env.DATABASE_URL || '';

let projectRef = '';

// Try standard format first
let match = databaseUrl.match(/@db\.([^.]+)\.supabase\.co/);
if (match) {
  projectRef = match[1];
} else {
  // Try pooler format: postgres.xxx in username or in host
  match = databaseUrl.match(/postgres\.([^:@]+)/);
  if (match) {
    projectRef = match[1];
  }
}

const supabaseUrl = `https://${projectRef}.supabase.co`;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Server-side, no session persistence needed
  },
});

// Storage bucket name for VO documents
export const VO_DOCUMENTS_BUCKET = 'vo-documents';

// File upload types
export type FileUploadType = 'ffcRsgProposed' | 'rsgAssessed' | 'dvoRrApproved';

/**
 * Upload a file to Supabase storage
 * @param voId - The VO ID
 * @param file - The file to upload
 * @param type - The type of file (ffcRsgProposed, rsgAssessed, dvoRrApproved)
 * @returns The public URL of the uploaded file
 */
export async function uploadVOFile(
  voId: number,
  file: File,
  type: FileUploadType
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${voId}/${type}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(VO_DOCUMENTS_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(VO_DOCUMENTS_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a file from Supabase storage
 * @param filePath - The file path to delete
 */
export async function deleteVOFile(filePath: string): Promise<void> {
  // Extract the path from the URL
  const path = filePath.split(`${VO_DOCUMENTS_BUCKET}/`)[1];

  if (!path) {
    throw new Error('Invalid file path');
  }

  const { error } = await supabase.storage
    .from(VO_DOCUMENTS_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get download URL for a file
 * @param filePath - The file path
 * @returns The download URL
 */
export function getDownloadUrl(filePath: string): string {
  return filePath; // The public URL can be used directly for download
}
