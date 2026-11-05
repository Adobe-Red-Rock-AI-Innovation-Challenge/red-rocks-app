import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Member } from "@/lib/types";

const COOKIE = "red_rocks_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type Session = {
  email: string;
  role: Member["role"];
  status: Member["status"];
  isAdmin: boolean;
};

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function createSession(session: Session) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return;

  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ ...session, expires })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function readSession(): Promise<Session | null> {
  const secret = process.env.SESSION_SECRET;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!secret || !value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  const session = JSON.parse(Buffer.from(payload, "base64url").toString());
  return session.expires > Date.now() / 1000 ? session : null;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

// Emails in DEMO_FAN_EMAILS sign in as a fan who is already an Inner Circle member, so the team can
// demo member-only features such as messaging athletes without paying.
export function demoFanEmails() {
  return (process.env.DEMO_FAN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
