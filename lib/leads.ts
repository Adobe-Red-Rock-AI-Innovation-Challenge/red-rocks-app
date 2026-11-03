import { database } from "@/lib/db";

export type Lead = {
  id: number;
  kind: "partner" | "fan";
  email: string;
  company: string;
  interest: string;
  name: string;
  phone: string;
  birth_date: string | null;
  created_at: string;
};

const MIN_AGE = 13;

function ageOn(birthDate: Date, today: Date) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export function parseLead(value: unknown): { lead: ReturnType<typeof clean>; error?: never } | { error: string; lead?: never } {
  if (typeof value !== "object" || value === null) return { error: "Please check your details" };
  const fields = value as Record<string, unknown>;
  const text = (field: unknown, max = 200) => (typeof field === "string" ? field.trim().slice(0, max) : "");
  const kind = fields.kind;
  const email = text(fields.email).toLowerCase();

  if (kind !== "partner" && kind !== "fan") return { error: "Please check your details" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email." };

  if (kind === "partner") {
    if (!text(fields.company)) return { error: "Enter your company or brand name." };
    return { lead: clean(kind, email, text(fields.company), text(fields.interest), "", "", null) };
  }

  const name = text(fields.name, 120);
  const birth = text(fields.birthDate, 10);
  if (!name) return { error: "Enter your name." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return { error: "Enter your date of birth." };
  const birthDate = new Date(`${birth}T00:00:00`);
  const age = ageOn(birthDate, new Date());
  if (Number.isNaN(age) || age < 0 || age > 120) return { error: "Enter a valid date of birth." };
  // Children's data needs a parent's consent, so the form stops here instead of storing it.
  if (age < MIN_AGE) return { error: "Fans under 13 need a parent or guardian to sign up for them." };
  return { lead: clean(kind, email, "", "", name, text(fields.phone, 30), birth) };
}

function clean(
  kind: "partner" | "fan",
  email: string,
  company: string,
  interest: string,
  name: string,
  phone: string,
  birthDate: string | null,
) {
  return { kind, email, company, interest, name, phone, birthDate };
}

export async function saveLead(lead: ReturnType<typeof clean>) {
  const db = await database();
  await db.query(
    "INSERT INTO leads (kind, email, company, interest, name, phone, birth_date) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [lead.kind, lead.email, lead.company, lead.interest, lead.name, lead.phone, lead.birthDate],
  );
}

export async function listLeads() {
  const db = await database();
  const { rows } = await db.query<Lead>(
    "SELECT id, kind, email, company, interest, name, phone, birth_date, created_at FROM leads ORDER BY created_at DESC LIMIT 200",
  );
  return rows;
}
