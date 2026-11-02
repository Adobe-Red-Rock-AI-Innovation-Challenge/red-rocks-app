import { Pool } from "pg";

// Vercel's Neon integration names the variable after its prefix, so accept both common names.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const pool = connectionString ? new Pool({ connectionString, max: 1 }) : null;

let ready: Promise<unknown> | null = null;

export function hasDatabase() {
  return pool !== null;
}

export function database() {
  if (!pool) throw new Error("DATABASE_URL is not set");
  ready ??= pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('sponsor', 'athlete')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'active')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE members ADD COLUMN IF NOT EXISTS registered BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS profile JSONB NOT NULL DEFAULT '{}';
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('partner', 'fan')),
      email TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      interest TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  return ready.then(() => pool);
}
