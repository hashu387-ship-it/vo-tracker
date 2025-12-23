# Payment Register Update - Feature Documentation

## Overview

The Payment Register has been redesigned with comprehensive CRUD functionality, enhanced VAT calculations, and project tracking capabilities.

## Key Features

### 1. Project Details Management

The system now includes comprehensive project tracking with:

- **Project Information**
  - Project Code (e.g., R06-HW2C05-5020)
  - Contractor Name
  - Contract Date
  - Original Contract Value
  - Revised Contract Value

- **Advance Payment Tracking**
  - Total Advance Payment Amount
  - Advance Payment Percentage (default: 32%)
  - Amount Deducted to Date
  - Deduction Percentage
  - Remaining Balance

- **Retention Tracking**
  - Total Retention Amount
  - Retention Percentage (default: 5%)
  - Amount Deducted to Date
  - Deduction Percentage
  - Remaining Balance

- **Work Summary**
  - Total Work Done (Amount & Percentage)
  - Balance Work Done
  - Received Amount
  - Payment Percentages

### 2. Enhanced Payment Calculations

#### Automatic Calculation Modes

The payment form now supports two calculation schemes:

**Initial Scheme (Legacy)**
- Advance Payment Recovery: 20%
- Retention: 10%

**Revised Scheme (Current)**
- Advance Payment Recovery: 32.09%
- Retention: 5%

#### Calculation Formula

When gross amount is entered, the system automatically calculates:

1. **Advance Payment Recovery** = Gross Amount × 32.09% (negative value)
2. **Retention** = Gross Amount × 5% (negative value)
3. **VAT Recovery for Advance Payment** = Advance Payment Recovery × 15% (negative value)
4. **VAT 15%** = Gross Amount × 15% (positive value)
5. **Net Payment** = Gross Amount - Advance Recovery - Retention - VAT Recovery + VAT 15%

### 3. Payment Status Tracking

Each payment application now includes:

- **Payment Status**
  - Draft
  - Submitted on ACONEX
  - Paid
  - Received

- **Live Action Tracking**
  - FFC Live Action (e.g., "Transaction Received")
  - RSG Live Action (e.g., "Transaction Placed")

- **Additional Fields**
  - Submitted Date (FFC to TRSDC)
  - Invoice Submitted Date
  - Remarks

### 4. Complete CRUD Operations

The payment register supports:

- **Create**: Add new payment applications with auto-calculation
- **Read**: View all payment records in a comprehensive table
- **Update**: Edit existing payment records
- **Delete**: Remove payment records (with confirmation)

## Database Schema Changes

### PaymentApplication Model

New fields added:
```typescript
- paymentStatus: String (default: "Draft")
- ffcLiveAction: String? (nullable)
- rsgLiveAction: String? (nullable)
- remarks: String? (nullable)
```

### ProjectDetails Model (New)

Complete project tracking model with:
- Project information
- Contract values
- Advance payment tracking
- Retention tracking
- Work summary statistics

## API Endpoints

### Project Details
- `GET /api/project-details` - Retrieve project details
- `POST /api/project-details` - Create or update project details

### Payment Applications
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create new payment
- `PUT /api/payments/[id]` - Update payment
- `DELETE /api/payments/[id]` - Delete payment

## Migration Instructions

To apply the database schema changes:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_project_details_and_payment_fields

# Or if in production
npx prisma migrate deploy
```

## Sample Data

### Project Details Example

Based on the R06-HW2C05-5020 project:

```json
{
  "projectCode": "R06-HW2C05-5020",
  "contractor": "First Fix",
  "contractDate": "2023-09-20",
  "originalContractValue": 217501556.12,
  "revisedContractValue": 232612538.97,
  "advancePaymentTotal": 65250466.83,
  "advancePaymentPercent": 32.0,
  "advanceDeductedTillDate": 54211168.65,
  "advanceDeductedPercent": 83.08,
  "advanceBalance": 11039298.18,
  "advanceBalancePercent": 16.92,
  "totalRetention": 11630626.95,
  "retentionPercent": 5.0,
  "retentionDeductedTillDate": 8663508.37,
  "retentionDeductedPercent": 74.49,
  "retentionBalance": 2967118.58,
  "retentionBalancePercent": 25.51,
  "totalWorkDone": 183107592.39,
  "totalWorkDonePercent": 78.72,
  "balanceWorkDone": 49504946.58,
  "balanceWorkDonePercent": 21.28,
  "receivedAmount": 173270167.85,
  "receivedPercent": 74.49
}
```

### Payment Application Example (IPA 15)

```json
{
  "paymentNo": "IPA 15",
  "description": "Jan 25th 2025 – Feb 25th 2025",
  "grossAmount": 14091614.85,
  "advancePaymentRecovery": -4521999.21,
  "retention": -1409161.49,
  "vatRecovery": -678299.88,
  "vat": 2113742.23,
  "netPayment": 9595896.51,
  "submittedDate": "2025-03-18",
  "invoiceDate": "2025-03-27",
  "paymentStatus": "Paid",
  "ffcLiveAction": "Transaction Received",
  "rsgLiveAction": "Transaction Placed",
  "remarks": null
}
```

## UI Components

### ProjectDetailsCard

Displays comprehensive project information including:
- Project details with edit capability
- Advance payment summary
- Retention summary
- Work summary dashboard

Located at: `components/payments/project-details-card.tsx`

### PaymentForm

Enhanced form with:
- Auto-calculation toggle
- Scheme selection (Initial/Revised)
- Status tracking fields
- Live action fields
- Date pickers for submission dates

Located at: `components/payments/payment-form.tsx`

### PaymentsPage

Main payment register page with:
- Project details summary cards
- Comprehensive payment table
- CRUD operations
- Status badges
- Responsive design

Located at: `app/(dashboard)/payments/page.tsx`

## Usage Guide

### Adding a New Payment Application

1. Click "New Payment Application" button
2. Enter Payment No (e.g., "IPA 24")
3. Enter Description (e.g., "Oct 25th 2025 – Nov 25th 2025")
4. Select calculation scheme (Initial or Revised)
5. Enter Gross Certified Amount
6. System auto-calculates:
   - Advance Payment Recovery
   - Retention
   - VAT Recovery
   - VAT 15%
   - Net Payment
7. Select Payment Status
8. Enter Live Action statuses (optional)
9. Add submission dates
10. Add remarks if needed
11. Click "Save Payment"

### Editing Project Details

1. Navigate to Payment Register page
2. Click the edit icon on Project Details card
3. Update necessary fields
4. Click save icon to confirm changes

### Managing Payment Records

- **View**: All payments display in the table with color-coded status badges
- **Edit**: Click edit icon on any payment row
- **Delete**: Click delete icon with confirmation prompt

## Notes

- All monetary values are stored and calculated in the base currency
- Negative values (deductions) are displayed in red
- Positive values (additions) are displayed in appropriate colors
- Auto-calculation can be disabled for manual entry
- The system maintains calculation history and audit trails

## Future Enhancements

Potential improvements for future releases:

1. Export to Excel with formatting
2. PDF report generation
3. Email notifications for status changes
4. Bulk import from spreadsheets
5. Advanced filtering and search
6. Payment approval workflow
7. Document attachment support
8. Multi-project support
9. Currency conversion
10. Historical trend analysis

## Support

For issues or questions, please contact the development team or refer to the main project documentation.

---

**Last Updated**: December 2024
**Version**: 2.0
**Author**: Development Team
