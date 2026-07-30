import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { accessSync, constants as fsConstants, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import * as schema from './schema';

/**
 * Database connection.
 *
 * Resolution order:
 *   1. TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) — hosted libSQL, for deployments.
 *   2. DATABASE_URL — any libsql:/http:/file: URL.
 *   3. A local libSQL file — the zero-configuration default, so
 *      `npm install && npm run dev` gives a working, writable register.
 *
 * The schema is created and seeded on first touch, which keeps the app
 * self-contained: no migration step is required before the first page load.
 */

export type StorageMode =
  /** A hosted libSQL database — shared between instances and durable. */
  | 'remote'
  /** A file beside the project — durable on a normal server or a laptop. */
  | 'local'
  /** A file in the OS temp directory — per-instance and lost on cold start. */
  | 'ephemeral';

/**
 * Picks a writable location for the local database. A serverless runtime mounts
 * the deployment read-only and gives each instance its own `/tmp`, so falling
 * back there keeps a preview deployment working — at the cost of the data being
 * per-instance and lost on a cold start. Set TURSO_DATABASE_URL for real
 * persistence; `storageMode` is surfaced in the UI so this is never a surprise.
 */
function localDatabaseFile(): { file: string; mode: StorageMode } {
  const preferred = path.resolve('.data/register.db');
  try {
    mkdirSync(path.dirname(preferred), { recursive: true });
    accessSync(path.dirname(preferred), fsConstants.W_OK);
    return { file: preferred, mode: 'local' };
  } catch {
    const fallback = path.join(tmpdir(), 'hw2c05-register.db');
    try {
      mkdirSync(path.dirname(fallback), { recursive: true });
    } catch {
      // tmpdir() always exists; nothing useful to do if even that fails.
    }
    return { file: fallback, mode: 'ephemeral' };
  }
}

/** The schemes @libsql/client can actually open. */
const LIBSQL_SCHEMES = ['libsql:', 'http:', 'https:', 'ws:', 'wss:', 'file:'];

/**
 * A DATABASE_URL left behind by a different application — a Postgres or MySQL
 * connection string, say — is not something libSQL can open, and handing it over
 * takes the whole app down at build time. Ignore anything it cannot speak and
 * fall back to local storage instead.
 */
function usableLibsqlUrl(value: string | undefined, name: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const scheme = trimmed.slice(0, trimmed.indexOf(':') + 1).toLowerCase();
  if (!LIBSQL_SCHEMES.includes(scheme)) {
    console.warn(
      `[register] Ignoring ${name}: "${scheme || trimmed}" is not a libSQL URL. ` +
        `Expected one of ${LIBSQL_SCHEMES.join(', ')}. Falling back to local storage.`,
    );
    return null;
  }
  return trimmed;
}

function resolveUrl(): { url: string; authToken?: string; mode: StorageMode } {
  const turso = usableLibsqlUrl(process.env.TURSO_DATABASE_URL, 'TURSO_DATABASE_URL');
  if (turso) return { url: turso, authToken: process.env.TURSO_AUTH_TOKEN, mode: 'remote' };

  const generic = usableLibsqlUrl(process.env.DATABASE_URL, 'DATABASE_URL');
  if (generic) {
    return {
      url: generic,
      authToken: process.env.DATABASE_AUTH_TOKEN,
      mode: generic.startsWith('file:') ? 'local' : 'remote',
    };
  }

  const { file, mode } = localDatabaseFile();
  return { url: `file:${file}`, mode };
}

declare global {
  var __registerDb:
    | { client: Client; db: LibSQLDatabase<typeof schema>; mode: StorageMode }
    | undefined;
  var __registerReady: Promise<void> | undefined;
}

function connect() {
  const { url, authToken, mode } = resolveUrl();
  const client = createClient({ url, authToken });
  return { client, db: drizzle(client, { schema }), mode };
}

const connection = globalThis.__registerDb ?? connect();
// Reused across requests in every environment; a serverless instance would
// otherwise open a fresh connection — and re-seed — on every invocation.
globalThis.__registerDb = connection;

export const client = connection.client;
export const db = connection.db;
export { schema };

/** Where the register is stored — drives the warning shown on /data. */
export const storageMode: StorageMode = connection.mode;

const DDL = [
  `CREATE TABLE IF NOT EXISTS projects (
     id TEXT PRIMARY KEY,
     code TEXT NOT NULL,
     name TEXT NOT NULL,
     contractor TEXT NOT NULL,
     client TEXT NOT NULL,
     contract_date TEXT,
     currency TEXT NOT NULL DEFAULT 'SAR',
     original_contract_value REAL NOT NULL DEFAULT 0,
     revised_contract_value REAL NOT NULL DEFAULT 0,
     advance_payment_total REAL NOT NULL DEFAULT 0,
     advance_payment_percent REAL NOT NULL DEFAULT 0.3,
     retention_cap_percent REAL NOT NULL DEFAULT 0.05,
     vat_rate REAL NOT NULL DEFAULT 0.15,
     data_as_of TEXT,
     source_workbook TEXT,
     updated_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS variations (
     id TEXT PRIMARY KEY,
     project_id TEXT NOT NULL,
     serial INTEGER NOT NULL,
     vo_number TEXT,
     aconex_date TEXT,
     dvo_reference TEXT,
     subject TEXT NOT NULL,
     submission_date TEXT,
     submission_type TEXT,
     submission_ref TEXT,
     response_ref TEXT,
     proposal_value REAL,
     client_assessment REAL,
     agreed_value REAL,
     status TEXT,
     vor_ref TEXT,
     dvo_ref TEXT,
     contractor_remarks TEXT,
     client_remarks TEXT,
     aconex_link TEXT,
     submission_link TEXT,
     owner TEXT,
     updated_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS payments (
     id TEXT PRIMARY KEY,
     project_id TEXT NOT NULL,
     sequence INTEGER NOT NULL,
     ref TEXT NOT NULL,
     kind TEXT NOT NULL DEFAULT 'interim',
     period TEXT,
     period_start TEXT,
     period_end TEXT,
     gross_certified REAL NOT NULL DEFAULT 0,
     advance_recovery REAL NOT NULL DEFAULT 0,
     back_charge REAL NOT NULL DEFAULT 0,
     retention REAL NOT NULL DEFAULT 0,
     vat_on_advance_recovery REAL NOT NULL DEFAULT 0,
     vat REAL NOT NULL DEFAULT 0,
     net_certified REAL NOT NULL DEFAULT 0,
     received REAL,
     submitted_date TEXT,
     tax_invoice_date TEXT,
     due_date TEXT,
     payment_note TEXT,
     status TEXT NOT NULL DEFAULT 'draft',
     collected_date TEXT,
     contractor_action TEXT,
     client_action TEXT,
     cumulative_gross REAL,
     updated_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS activity (
     id TEXT PRIMARY KEY,
     entity TEXT NOT NULL,
     entity_id TEXT,
     entity_label TEXT,
     action TEXT NOT NULL,
     summary TEXT NOT NULL,
     detail TEXT,
     actor TEXT NOT NULL DEFAULT 'Commercial team',
     at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS variations_status_idx ON variations (status)`,
  `CREATE INDEX IF NOT EXISTS variations_serial_idx ON variations (serial)`,
  `CREATE INDEX IF NOT EXISTS variations_vo_number_idx ON variations (vo_number)`,
  `CREATE INDEX IF NOT EXISTS payments_sequence_idx ON payments (sequence)`,
  `CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status)`,
  `CREATE INDEX IF NOT EXISTS activity_at_idx ON activity (at)`,
];

export async function migrate(): Promise<void> {
  for (const statement of DDL) {
    await client.execute(statement);
  }
}
