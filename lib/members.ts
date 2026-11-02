import { Pool } from "pg";
import type { Member } from "@/lib/types";

// Vercel's Neon integration names the variable after its prefix, so accept both common names.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const pool = connectionString ? new Pool({ connectionString, max: 1 }) : null;

const COLUMNS = "email, name, role, status, registered, profile";

let ready: Promise<unknown> | null = null;

function database() {
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
  `);
  return ready.then(() => pool);
}

export function hasDatabase() {
  return pool !== null;
}

// Unknown Gmail accounts start unregistered and pending; an admin approves the role they ask for.
export async function findOrCreateMember(email: string, name: string): Promise<Member> {
  const db = await database();
  const { rows } = await db.query<Member>(
    `INSERT INTO members (email, name, role, status, registered)
     VALUES ($1, $2, 'sponsor', 'pending', false)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING ${COLUMNS}`,
    [email, name],
  );
  return rows[0];
}

// Registering never activates anyone; it records the requested role for an admin to approve.
export async function registerMember(
  email: string,
  name: string,
  role: Member["role"],
  profile: Record<string, string>,
) {
  const db = await database();
  const { rows } = await db.query<Member>(
    `UPDATE members SET name = $2, role = $3, profile = $4, registered = true, status = 'pending'
     WHERE email = $1 AND registered = false
     RETURNING ${COLUMNS}`,
    [email, name, role, JSON.stringify(profile)],
  );
  return rows[0] ?? null;
}

export async function listMembers() {
  const db = await database();
  const { rows } = await db.query<Member>(
    `SELECT ${COLUMNS} FROM members ORDER BY status, name`,
  );
  return rows;
}

export async function saveMember(member: Pick<Member, "email" | "name" | "role" | "status">) {
  const db = await database();
  await db.query(
    `INSERT INTO members (email, name, role, status) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name, role = EXCLUDED.role, status = EXCLUDED.status, registered = true`,
    [member.email, member.name, member.role, member.status],
  );
}

export async function removeMember(email: string) {
  const db = await database();
  await db.query("DELETE FROM members WHERE email = $1", [email]);
}
