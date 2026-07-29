# HW2C05 Commercial Register

Variation order and payment register for **R06-HW2C05 — Shura West Hotel 02, MEP package**
(First Fix Contracting for Red Sea Global).

It replaces the "Pay Reg & VO LOG" spreadsheet with a live application: the same
registers, the same numbers, but searchable, filterable, auditable and reachable over
an API — and it still reads and writes the workbook, so nothing about the existing
process has to change.

All values are SAR.

---

## What it does

| Area | What you get |
|---|---|
| **Command centre** (`/`) | Contract position at a glance — revised contract, work done, cash received, outstanding, variations, advance recovery and retention, with an S-curve of certified vs collected. |
| **Variation orders** (`/variations`) | The full VO log: search across every field, filter by status / type / owner / valuation, sortable columns, column visibility, pagination, CSV export. |
| **VO board** (`/variations/board`) | The same log as a status board. Drag a card between columns — or use the select on the card for keyboard and touch — and the change is written immediately. |
| **Payment register** (`/payments`) | Every advance payment and interim application with all deduction columns, pinned totals row, outstanding-only filter and per-certificate detail. |
| **Cash flow** (`/cashflow`) | Certified vs collected, ageing of uncollected certificates, gross→net bridge, and a completion projection from the recent run rate. |
| **Analytics** (`/analytics`) | Variation value by status, largest additions and omissions, cost proposal vs Employer assessment with movement, workload by owner. |
| **Activity** (`/activity`) | Audit trail of every change made through the app, grouped by day. |
| **Data & contract** (`/data`) | Import the source workbook, export a styled workbook or CSV, edit contract particulars, review data-quality notes. |
| **Report** (`/report`) | A print-ready single-page commercial summary. |

Plus: ⌘K / Ctrl-K command palette over every VO, certificate and page; light, dark and
system themes; a REST API; and full keyboard and screen-reader support.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

No configuration, no database to provision. On first request the app creates a local
libSQL database at `.data/register.db` and loads the workbook extract in
`data/seed/` — 84 variations and 33 payment certificates.

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run db:seed      # force the register back to the workbook extract
npm run db:reset     # delete the local database and reseed
```

## Deploying

The register is a normal Next.js app. The only thing it needs in production is a
database that persists across requests, because a serverless filesystem does not.

Point it at a hosted libSQL (Turso) instance:

```
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=...
```

`DATABASE_URL` works too and accepts any `libsql://`, `http://` or `file:` URL. See
`.env.example`. The schema is created and seeded automatically the first time the app
touches an empty database, so there is no migration step before the first page load.

## The numbers

Everything on screen is derived at request time from the register rows — nothing is
stored pre-aggregated. The definitions deliberately reproduce the source workbook's
own summary blocks so the app and the spreadsheet agree:

- **Total work done** counts certificates that are certified or better. A claim still
  *Under Review* is not work done — matching the workbook's own treatment.
- **Advance and retention "deducted till date"** likewise exclude an un-assessed claim,
  because that deduction is still contingent.
- **Retention** is capped at 5% of the *revised* contract value rather than accumulated
  from the per-certificate deductions, because the deduction rate steps from 10% to 5%
  at the 50% release.

As of the 12 May 2026 revision this reconciles to:

| | Workbook | App |
|---|---|---|
| Revised contract | 232,860,904.00 | 232,860,904.00 |
| Total work done | 222,047,056.42 | 222,047,056.41 |
| Received | 218,808,603.36 | 218,808,603.35 |
| Retention deducted | 11,102,352.80 | 11,102,352.82 |
| Total submitted variations | 25,035,631.62 | 25,035,631.62 |

(Sub-halala differences come from rounding each cell to 2 decimal places on import;
the workbook carries full float precision in its formulas.)

## Excel in, Excel out

**Import** (`/data`) reads the "VO LOG" and "Payment Register" sheets. It finds the
header row by pattern rather than by fixed offset, maps every field by its header
label with the original column positions as a fallback, and copes with the quirks in
the real file — shared formulas in the S.No column, a merged two-row header band, and
inconsistent status spellings. Both the original workbook and this app's own export
import cleanly.

**Export** produces a styled three-sheet workbook (Summary, VO Log, Payment Register)
in the project's reporting aesthetic, with totals rows, number formats and filters
already applied. CSV exports of either register are available too.

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/summary` | The whole commercial position as JSON |
| `GET` `POST` | `/api/variations` | List (filter by `status`, `q`) / create |
| `GET` `PATCH` `DELETE` | `/api/variations/{id}` | Read, partially update, remove |
| `GET` `POST` | `/api/payments` | List (filter by `status`, `outstanding`) / create |
| `GET` `PATCH` `DELETE` | `/api/payments/{id}` | Read, partially update, remove |
| `GET` | `/api/export?format=xlsx` | Styled workbook |
| `GET` | `/api/export?format=csv&sheet=variations\|payments` | CSV of either register |

## How it is built

- **Next.js 16** (App Router, React 19, Server Actions) with TypeScript in strict mode
- **Drizzle ORM** over **libSQL** — one driver for a local file and hosted Turso
- **Zod** validating every mutation, on the server, for both forms and the API
- **Tailwind CSS** design system on the Red Sea Global palette (Deep Navy `#0A2533`,
  Lagoon Teal `#008C95`, Sand Gold `#C5A065`, Light Sand `#F7F5F0`)
- **Recharts** for the figures, **ExcelJS** for workbook read/write

Layout:

```
app/            routes — pages, API handlers
components/
  charts/       chart frame, theme and the figures themselves
  payments/     payment register table and form
  variations/   VO table, board, form, status picker
  register/     shared page furniture (KPI tiles, chips, headers)
  shell/        sidebar, topbar, command palette, theme toggle
  ui/           primitives
lib/
  db/           schema, client, queries, seed
  domain/       types, money formatting, the calculation engine
  excel/        workbook import and export
  actions.ts    server actions (all mutations)
data/
  seed/         the workbook extract the app ships with
  source/       the source workbook itself, for reference
scripts/        workbook extraction and CLI seeding
```

### Notes on the design

Charts follow one rule set: colour is assigned by the job it does, never by rank;
there are no dual axes; every figure with more than one series carries a legend and a
table view, so identity is never colour-alone. The light and dark chart palettes are
two separately chosen sets of steps — not an automatic inversion — and both were run
through a palette validator for lightness banding, chroma, colour-vision-deficiency
separation and contrast against their own surface. Status colours are reserved and
always ship with an icon and a label.

### Data quality

The register keeps the source data exactly as issued rather than silently correcting
it. Where the workbook is internally inconsistent — two certificates both labelled
"IPA 30", a variation with no status — the app flags it under **Data & contract →
Data quality** and links straight to the record.
