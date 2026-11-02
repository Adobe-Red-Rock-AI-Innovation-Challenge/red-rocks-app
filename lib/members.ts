import { Pool } from "pg";
import type { Member } from "@/lib/types";

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  : null;

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
    )
  `);
  return ready.then(() => pool);
}

export function hasDatabase() {
  return pool !== null;
}

// Nobody can claim to be an athlete: unknown Gmail accounts start as sponsors awaiting approval.
export async function findOrCreateMember(email: string, name: string): Promise<Member> {
  const db = await database();
  const { rows } = await db.query<Member>(
    `INSERT INTO members (email, name, role, status)
     VALUES ($1, $2, 'sponsor', 'pending')
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING email, name, role, status`,
    [email, name],
  );
  return rows[0];
}

export async function listMembers() {
  const db = await database();
  const { rows } = await db.query<Member>(
    "SELECT email, name, role, status FROM members ORDER BY status, name",
  );
  return rows;
}

export async function saveMember(member: Member) {
  const db = await database();
  await db.query(
    `INSERT INTO members (email, name, role, status) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name, role = EXCLUDED.role, status = EXCLUDED.status`,
    [member.email, member.name, member.role, member.status],
  );
}

export async function removeMember(email: string) {
  const db = await database();
  await db.query("DELETE FROM members WHERE email = $1", [email]);
}
