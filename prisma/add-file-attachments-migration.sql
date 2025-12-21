-- Migration: Add file attachment fields to variation_orders table
-- Run this migration manually if prisma migrate is not available

ALTER TABLE variation_orders
ADD COLUMN IF NOT EXISTS "ffcRsgProposedFile" TEXT,
ADD COLUMN IF NOT EXISTS "rsgAssessedFile" TEXT,
ADD COLUMN IF NOT EXISTS "dvoRrApprovedFile" TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN variation_orders."ffcRsgProposedFile" IS 'Excel file for FFC/RSG Proposed (pending statuses)';
COMMENT ON COLUMN variation_orders."rsgAssessedFile" IS 'Excel file for RSG Assessed (approved)';
COMMENT ON COLUMN variation_orders."dvoRrApprovedFile" IS 'Excel file for DVO RR Approved (final)';
