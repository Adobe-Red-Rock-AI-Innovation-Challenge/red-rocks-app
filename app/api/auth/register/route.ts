import { hasDatabase, registerMember } from "@/lib/members";
import { parseRegistration } from "@/lib/registration";
import { createSession, readSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  if (!hasDatabase()) return Response.json({ error: "Database not set up" }, { status: 503 });

  const registration = parseRegistration(await request.json().catch(() => null));
  if (!registration) return Response.json({ error: "Please fill in the required fields" }, { status: 400 });

  const member = await registerMember(
    session.email,
    registration.name,
    registration.role,
    registration.profile,
  );
  if (!member) return Response.json({ error: "This account is already registered" }, { status: 409 });

  await createSession({ ...session, role: member.role, status: member.status });
  return Response.json({ role: member.role, status: member.status });
}
