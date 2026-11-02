import { database } from "@/lib/db";

export type Lead = {
  id: number;
  kind: "partner" | "fan";
  email: string;
  company: string;
  interest: string;
  created_at: string;
};

export function parseLead(value: unknown) {
  if (typeof value !== "object" || value === null) return null;
  const { kind, email, company, interest } = value as Record<string, unknown>;
  if (kind !== "partner" && kind !== "fan") return null;
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return null;
  const text = (field: unknown) => (typeof field === "string" ? field.trim().slice(0, 200) : "");
  if (kind === "partner" && !text(company)) return null;
  return { kind, email: email.trim().toLowerCase(), company: text(company), interest: text(interest) };
}

export async function saveLead(lead: NonNullable<ReturnType<typeof parseLead>>) {
  const db = await database();
  await db.query("INSERT INTO leads (kind, email, company, interest) VALUES ($1, $2, $3, $4)", [
    lead.kind,
    lead.email,
    lead.company,
    lead.interest,
  ]);
}

export async function listLeads() {
  const db = await database();
  const { rows } = await db.query<Lead>(
    "SELECT id, kind, email, company, interest, created_at FROM leads ORDER BY created_at DESC LIMIT 200",
  );
  return rows;
}
