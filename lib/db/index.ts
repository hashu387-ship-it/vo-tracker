/**
 * Lazy Drizzle client for the enterprise schema (Supabase Postgres).
 *
 * Intentionally NOT imported by any React Server Component / page — call
 * `getDb()` only inside server actions / route handlers that need the DB, so
 * the app keeps building and rendering even when DATABASE_URL is unset (the
 * current data surfaces still read from lib/data/* until the DB is wired).
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add the Supabase Postgres connection string to enable the enterprise database layer.',
    );
  }
  const client = postgres(url, { prepare: false });
  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
