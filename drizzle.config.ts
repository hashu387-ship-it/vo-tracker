import type { Config } from 'drizzle-kit';

/**
 * Drizzle Kit config — generates/pushes the enterprise schema to Postgres
 * (Supabase). Requires DATABASE_URL. Run `create extension if not exists vector;`
 * on the database before the first push so the pgvector column type resolves.
 */
export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
} satisfies Config;
