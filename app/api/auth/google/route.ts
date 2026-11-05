import { findOrCreateMember, hasDatabase } from "@/lib/members";
import { adminEmails, createSession, demoFanEmails } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (typeof body?.credential !== "string" || typeof body?.nonce !== "string" || !clientId) {
    return Response.json({ error: "Invalid sign-in" }, { status: 400 });
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
  );
  const claims = await response.json().catch(() => null);

  // Google checks the signature and expiry; these checks tie the token to this app and this attempt.
  const valid =
    response.ok &&
    claims?.aud === clientId &&
    claims?.nonce === body.nonce &&
    claims?.email_verified === "true";
  if (!valid) return Response.json({ error: "Invalid sign-in" }, { status: 401 });

  const email = String(claims.email).toLowerCase();
  const name = claims.name ?? email;
  const isAdmin = adminEmails().includes(email);
  const demoFan = demoFanEmails().includes(email);

  try {
    // Admins come from ADMIN_EMAILS, so they never need a member row or approval. Demo fans
    // always sign in as a fan, even when they are also admins.
    const member = demoFan
      ? { role: "fan" as const, status: "active" as const, registered: true }
      : hasDatabase() && !isAdmin
        ? await findOrCreateMember(email, name)
        : { role: "sponsor" as const, status: isAdmin ? ("active" as const) : ("pending" as const), registered: true };
    const access = { role: member.role, status: member.status };

    await createSession({ email, isAdmin, ...access });
    return Response.json({
      user: { name, email, picture: claims.picture, provider: "google", isAdmin, status: access.status },
      role: access.role,
      needsRegistration: !member.registered,
      demoMembership: demoFan ? "inner" : null,
    });
  } catch (error) {
    console.error("Could not load member", error);
    return Response.json({ error: "Sign-in is unavailable" }, { status: 503 });
  }
}
