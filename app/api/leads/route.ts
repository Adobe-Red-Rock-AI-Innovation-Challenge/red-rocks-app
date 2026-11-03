import { hasDatabase } from "@/lib/db";
import { parseLead, saveLead } from "@/lib/leads";

export async function POST(request: Request) {
  const parsed = parseLead(await request.json().catch(() => null));
  if (parsed.error !== undefined) return Response.json({ error: parsed.error }, { status: 400 });

  // Without a database the demo still answers, but nothing is stored.
  if (!hasDatabase()) return Response.json({ saved: false });

  try {
    await saveLead(parsed.lead);
    return Response.json({ saved: true });
  } catch (error) {
    console.error("Could not save lead", error);
    return Response.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
