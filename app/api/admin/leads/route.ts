import { hasDatabase } from "@/lib/db";
import { listLeads } from "@/lib/leads";
import { readSession } from "@/lib/session";

export async function GET() {
  const session = await readSession();
  if (!session?.isAdmin) return Response.json({ error: "Admins only" }, { status: 403 });
  if (!hasDatabase()) return Response.json({ error: "Database not set up" }, { status: 503 });
  return Response.json({ leads: await listLeads() });
}
