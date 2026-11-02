import { database } from "@/lib/db";
import type { Member } from "@/lib/types";

export { hasDatabase } from "@/lib/db";

const COLUMNS = "email, name, role, status, registered, profile";

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
