# VO Tracker - Variation Orders Management System

A production-ready enterprise web application for tracking Variation Orders (VO), Rework items, and General Correspondence used in construction projects.

## Features

- **Dashboard**: Real-time KPI cards showing total VOs, pending items, approved amounts, and financial summaries
- **VO Management**: Full CRUD operations with Excel-like table interface
- **Search & Filters**: Search by subject/reference, filter by status and submission type
- **Sorting & Pagination**: Sort by date, value; paginated results
- **Role-Based Access**: Admin (full CRUD + export) and Viewer (read-only) roles
- **Excel Export**: Export filtered data to `.xlsx` format
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop and tablet

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Other**: Zod validation, Framer Motion, ExcelJS

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Clerk account (for authentication)

## Quick Start

### 1. Clone and Install

```bash
cd vo-tracker
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following environment variables:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/vo_tracker?schema=public"

# Clerk Authentication - Get these from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs (keep as is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Setup Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy the publishable key and secret key to your `.env`
4. In Clerk Dashboard, go to **Users** > Select a user > **Public Metadata**
5. Add the following JSON to grant admin access:
   ```json
   {
     "role": "admin"
   }
   ```
   Users without this metadata will default to "viewer" role.

### 4. Database Setup

Create the database and run migrations:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 5. Seed Sample Data

```bash
npm run db:seed
```

This will populate the database with 12 sample Variation Orders.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vo-tracker/
├── app/
│   ├── (auth)/                 # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/            # Protected dashboard pages
│   │   ├── dashboard/          # Dashboard with KPIs
│   │   └── vos/                # VO CRUD pages
│   │       ├── [id]/           # View/Edit VO
│   │       └── new/            # Create VO
│   ├── api/
│   │   ├── vo/                 # VO CRUD endpoints
│   │   └── export/             # Excel export endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Landing page
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── layout/                 # Header, navigation
│   ├── providers/              # Theme, Query providers
│   ├── ui/                     # shadcn/ui components
│   └── vo/                     # VO-specific components
├── lib/
│   ├── hooks/                  # React Query hooks
│   ├── validations/            # Zod schemas
│   ├── auth.ts                 # Auth utilities
│   ├── db.ts                   # Prisma client
│   └── utils.ts                # Helper functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
├── middleware.ts               # Clerk auth middleware
└── package.json
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/vo` | List VOs with filters | Yes |
| POST | `/api/vo` | Create VO | Admin |
| GET | `/api/vo/:id` | Get single VO | Yes |
| PUT | `/api/vo/:id` | Update VO | Admin |
| DELETE | `/api/vo/:id` | Delete VO | Admin |
| GET | `/api/vo/stats` | Get dashboard stats | Yes |
| GET | `/api/export` | Export to Excel | Admin |

### Query Parameters (GET /api/vo)

- `search` - Search in subject, references
- `status` - Filter by status
- `submissionType` - Filter by type (VO, GenCorr, RFI, Email)
- `sortBy` - Sort field (submissionDate, createdAt, proposalValue, approvedAmount)
- `sortOrder` - asc or desc
- `page` - Page number
- `limit` - Items per page (max 100)

## Data Model

### VO Entity

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Auto-increment primary key |
| subject | String | Required, max 500 chars |
| submissionType | Enum | VO, GenCorr, RFI, Email |
| submissionReference | String? | Optional reference |
| responseReference | String? | Optional response ref |
| submissionDate | DateTime | Required |
| assessmentValue | Float? | Optional |
| proposalValue | Float? | Optional |
| approvedAmount | Float? | Optional |
| status | Enum | Pending, PendingWithClient, PendingWithConsultant, Approved, DVOIssued, ClosedOut |
| vorReference | String? | VOR reference |
| dvoReference | String? | DVO reference |
| dvoIssuedDate | DateTime? | Optional |
| remarks | Text? | Optional notes |
| actionNotes | Text? | Action items |
| createdAt | DateTime | Auto-generated |
| updatedAt | DateTime | Auto-updated |

## User Roles

### Admin
- Full CRUD access
- Export to Excel
- Can see all action buttons

### Viewer
- Read-only access
- Can view dashboard and VO list
- Cannot create, edit, or delete
- No export button

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Self-hosted

```bash
npm run build
npm run start
```

Make sure to:
- Set `NODE_ENV=production`
- Use a production PostgreSQL database
- Configure Clerk for production

## License

MIT
