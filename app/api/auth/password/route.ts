import { createPasswordMember, findPasswordMember, hasDatabase } from "@/lib/members";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/passwords";
import { adminEmails, createSession, demoFanEmails } from "@/lib/session";
import type { Role } from "@/lib/types";

const ATHLETE_DOMAIN = "@umail.utah.edu";
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

// Slows guessing on one instance. A shared store would be needed to limit across instances.
const attempts = new Map<string, { count: number; since: number }>();

function tooManyAttempts(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.since > WINDOW_MS) {
    attempts.set(key, { count: 1, since: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function fail(error: string, status = 400) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const mode = body?.mode;
  const role = body?.role as Role;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if ((mode !== "signin" && mode !== "signup") || !["sponsor", "athlete", "fan"].includes(role)) {
    return fail("Invalid request");
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return fail("Enter a valid email.");
  if (role === "athlete" && !email.endsWith(ATHLETE_DOMAIN)) {
    return fail(`Athletes sign in with their umail (${ATHLETE_DOMAIN}).`);
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
    return fail(`Passwords need at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!hasDatabase()) return fail("Accounts are not available right now.", 503);

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooManyAttempts(`${forwarded}:${email}`)) {
    return fail("Too many tries. Please wait a few minutes.", 429);
  }

  let member;
  if (mode === "signup") {
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    if (!name) return fail("Enter your name.");
    member = await createPasswordMember(email, name, role, await hashPassword(password));
    if (!member) return fail("That email already has an account. Sign in instead.", 409);
  } else {
    const found = await findPasswordMember(email);
    // One message for both cases, so the form never reveals which emails have accounts.
    if (!found?.password_hash || !(await verifyPassword(password, found.password_hash))) {
      return fail("Email or password is incorrect.", 401);
    }
    member = found;
  }

  const isAdmin = adminEmails().includes(email);
  const demoFan = demoFanEmails().includes(email);
  const memberRole = demoFan ? "fan" : member.role;
  const status = isAdmin || demoFan ? "active" : member.status;
  await createSession({ email, role: memberRole, status, isAdmin });
  return Response.json({
    user: { name: member.name, email, provider: "password", isAdmin, status },
    role: memberRole,
    demoMembership: demoFan ? "inner" : null,
  });
}
