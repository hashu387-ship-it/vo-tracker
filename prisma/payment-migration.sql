-- Migration SQL for Payment Register with Project Details
-- Run this in your Supabase SQL Editor or PostgreSQL database

-- Step 1: Alter payment_applications table to add new fields
ALTER TABLE payment_applications
  RENAME COLUMN status TO payment_status;

ALTER TABLE payment_applications
  ADD COLUMN IF NOT EXISTS ffc_live_action TEXT,
  ADD COLUMN IF NOT EXISTS rsg_live_action TEXT,
  ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Step 2: Create project_details table
CREATE TABLE IF NOT EXISTS project_details (
  id SERIAL PRIMARY KEY,
  project_code TEXT UNIQUE NOT NULL,
  project_name TEXT NOT NULL DEFAULT '',
  contractor TEXT NOT NULL,
  contract_date TIMESTAMP NOT NULL,

  -- Contract values
  original_contract_value DOUBLE PRECISION NOT NULL,
  revised_contract_value DOUBLE PRECISION NOT NULL,

  -- Advance payment details
  advance_payment_total DOUBLE PRECISION NOT NULL,
  advance_payment_percent DOUBLE PRECISION DEFAULT 32.0,
  advance_deducted_till_date DOUBLE PRECISION DEFAULT 0,
  advance_deducted_percent DOUBLE PRECISION DEFAULT 0,
  advance_balance DOUBLE PRECISION DEFAULT 0,
  advance_balance_percent DOUBLE PRECISION DEFAULT 0,

  -- Retention details
  total_retention DOUBLE PRECISION DEFAULT 0,
  retention_percent DOUBLE PRECISION DEFAULT 5.0,
  retention_deducted_till_date DOUBLE PRECISION DEFAULT 0,
  retention_deducted_percent DOUBLE PRECISION DEFAULT 0,
  retention_balance DOUBLE PRECISION DEFAULT 0,
  retention_balance_percent DOUBLE PRECISION DEFAULT 0,

  -- Work summary
  total_work_done DOUBLE PRECISION DEFAULT 0,
  total_work_done_percent DOUBLE PRECISION DEFAULT 0,
  balance_work_done DOUBLE PRECISION DEFAULT 0,
  balance_work_done_percent DOUBLE PRECISION DEFAULT 0,

  received_amount DOUBLE PRECISION DEFAULT 0,
  received_percent DOUBLE PRECISION DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Insert default project details (R06-HW2C05-5020)
INSERT INTO project_details (
  project_code,
  project_name,
  contractor,
  contract_date,
  original_contract_value,
  revised_contract_value,
  advance_payment_total,
  advance_payment_percent,
  advance_deducted_till_date,
  advance_deducted_percent,
  advance_balance,
  advance_balance_percent,
  total_retention,
  retention_percent,
  retention_deducted_till_date,
  retention_deducted_percent,
  retention_balance,
  retention_balance_percent,
  total_work_done,
  total_work_done_percent,
  balance_work_done,
  balance_work_done_percent,
  received_amount,
  received_percent
) VALUES (
  'R06-HW2C05-5020',
  '',
  'First Fix',
  '2023-09-20',
  217501556.12,
  232612538.97,
  65250466.83,
  32.0,
  54211168.65,
  83.08,
  11039298.18,
  16.92,
  11630626.95,
  5.0,
  8663508.37,
  74.49,
  2967118.58,
  25.51,
  183107592.39,
  78.72,
  49504946.58,
  21.28,
  173270167.85,
  74.49
)
ON CONFLICT (project_code) DO UPDATE SET
  contractor = EXCLUDED.contractor,
  original_contract_value = EXCLUDED.original_contract_value,
  revised_contract_value = EXCLUDED.revised_contract_value,
  advance_payment_total = EXCLUDED.advance_payment_total,
  advance_deducted_till_date = EXCLUDED.advance_deducted_till_date,
  advance_deducted_percent = EXCLUDED.advance_deducted_percent,
  advance_balance = EXCLUDED.advance_balance,
  advance_balance_percent = EXCLUDED.advance_balance_percent,
  total_retention = EXCLUDED.total_retention,
  retention_deducted_till_date = EXCLUDED.retention_deducted_till_date,
  retention_deducted_percent = EXCLUDED.retention_deducted_percent,
  retention_balance = EXCLUDED.retention_balance,
  retention_balance_percent = EXCLUDED.retention_balance_percent,
  total_work_done = EXCLUDED.total_work_done,
  total_work_done_percent = EXCLUDED.total_work_done_percent,
  balance_work_done = EXCLUDED.balance_work_done,
  balance_work_done_percent = EXCLUDED.balance_work_done_percent,
  received_amount = EXCLUDED.received_amount,
  received_percent = EXCLUDED.received_percent,
  updated_at = NOW();

-- Success message
SELECT 'Migration completed successfully!' as message;
SELECT COUNT(*) as project_count FROM project_details;
SELECT COUNT(*) as payment_count FROM payment_applications;
