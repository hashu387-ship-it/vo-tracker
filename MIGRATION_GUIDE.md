# Payment Register Migration Guide

## Quick Start - Run Migration in Supabase

### Option 1: Run SQL Directly in Supabase (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Run the Migration**
   - Copy the entire contents of `prisma/payment-migration.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Success**
   - You should see "Migration completed successfully!"
   - Check the counts: 1 project_count, X payment_count

### Option 2: Run via Prisma (If you have local access)

```bash
# Set environment variable to use production database
export DATABASE_URL="your-supabase-connection-string"

# Run migration
npx prisma db push

# Verify with Prisma Studio
npx prisma studio
```

## What This Migration Does

### 1. Updates PaymentApplication Table
- Renames `status` column to `payment_status`
- Adds `ffc_live_action` field (FFC Live Action tracking)
- Adds `rsg_live_action` field (RSG Live Action tracking)
- Adds `remarks` field (Additional notes)

### 2. Creates ProjectDetails Table
New table with comprehensive project tracking:
- Project information (code, contractor, dates)
- Contract values (original, revised)
- Advance payment tracking with balances
- Retention tracking with balances
- Work summary statistics

### 3. Seeds Initial Data
Inserts project details for **R06-HW2C05-5020** (First Fix project)

## Post-Migration Steps

### 1. Verify Data in Supabase

```sql
-- Check project details
SELECT * FROM project_details;

-- Check payment applications
SELECT payment_no, payment_status, gross_amount, net_payment
FROM payment_applications
ORDER BY id DESC
LIMIT 10;
```

### 2. Test the Application

1. Visit your deployed Vercel URL
2. Navigate to Payment Register page
3. You should see:
   - Project details cards with R06-HW2C05-5020 data
   - Summary cards (Advance Payment, Retention, Work Summary)
   - Payment records table (if you have payment data)

### 3. Add Payment Records

Click "New Payment Application" and add your IPA records:

**Example: IPA 15**
- Payment No: IPA 15
- Description: Jan 25th 2025 – Feb 25th 2025
- Gross Amount: 14091614.85
- Select scheme: Revised (32.09% / 5%)
- Auto-calculation will fill:
  - Advance Recovery: -4521999.21
  - Retention: -1409161.49
  - VAT Recovery: -678299.88
  - VAT 15%: 2113742.23
  - Net Payment: 9595896.51
- Payment Status: Paid
- FFC Live Action: Transaction Received
- RSG Live Action: Transaction Placed

## Troubleshooting

### Issue: Column "status" doesn't exist

**Solution:** The payment_applications table might already have been updated. Try running only parts 2 and 3 of the migration:

```sql
-- Skip the ALTER TABLE part, just run CREATE TABLE and INSERT
```

### Issue: Table already exists

**Solution:** The migration uses `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT` clauses, so it's safe to run multiple times.

### Issue: No data showing on frontend

**Possible causes:**
1. Migration not run yet - Run the SQL migration
2. API authentication issues - Check Clerk authentication
3. Database connection issues - Verify DATABASE_URL in Vercel environment variables

**Check API directly:**
```bash
curl https://your-app.vercel.app/api/project-details
curl https://your-app.vercel.app/api/payments
```

## Environment Variables

Make sure these are set in Vercel:

```env
DATABASE_URL="your-supabase-postgres-connection-string"
DIRECT_URL="your-supabase-direct-connection-string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-key"
CLERK_SECRET_KEY="your-clerk-secret"
```

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Rollback: Rename column back
ALTER TABLE payment_applications
  RENAME COLUMN payment_status TO status;

-- Remove new columns
ALTER TABLE payment_applications
  DROP COLUMN IF EXISTS ffc_live_action,
  DROP COLUMN IF EXISTS rsg_live_action,
  DROP COLUMN IF EXISTS remarks;

-- Drop new table
DROP TABLE IF EXISTS project_details;
```

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set
4. Check API endpoints are responding

## Success Checklist

- [ ] SQL migration ran without errors
- [ ] Project details table created
- [ ] Initial project data inserted
- [ ] Payment applications table updated
- [ ] Frontend shows project details cards
- [ ] Frontend shows work summary
- [ ] Can create new payment applications
- [ ] Auto-calculation works correctly
- [ ] All CRUD operations work (Create, Read, Update, Delete)

---

**Migration Version:** 1.0
**Last Updated:** December 2024
**Project:** VO Tracker - Payment Register Enhancement
