import { hasDatabase, listMembers, removeMember, saveMember } from "@/lib/members";
import { readSession } from "@/lib/session";
import type { Member } from "@/lib/types";

function parseMember(value: unknown): Pick<Member, "email" | "name" | "role" | "status"> | null {
  if (typeof value !== "object" || value === null) return null;
  const { email, name, role, status } = value as Record<string, unknown>;
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) return null;
  if (typeof name !== "string" || !name.trim()) return null;
  if (role !== "sponsor" && role !== "athlete") return null;
  if (status !== "pending" && status !== "active") return null;
  return { email: email.trim().toLowerCase(), name: name.trim().slice(0, 120), role, status };
}

async function denied() {
  const session = await readSession();
  if (!session?.isAdmin) return Response.json({ error: "Admins only" }, { status: 403 });
  if (!hasDatabase()) return Response.json({ error: "Database not set up" }, { status: 503 });
  return null;
}

export async function GET() {
  const blocked = await denied();
  if (blocked) return blocked;
  return Response.json({ members: await listMembers() });
}

export async function POST(request: Request) {
  const blocked = await denied();
  if (blocked) return blocked;

  const member = parseMember(await request.json().catch(() => null));
  if (!member) return Response.json({ error: "Invalid member" }, { status: 400 });
  await saveMember(member);
  return Response.json({ members: await listMembers() });
}

export async function DELETE(request: Request) {
  const blocked = await denied();
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  if (typeof body?.email !== "string") {
    return Response.json({ error: "Invalid member" }, { status: 400 });
  }
  await removeMember(body.email);
  return Response.json({ members: await listMembers() });
}
