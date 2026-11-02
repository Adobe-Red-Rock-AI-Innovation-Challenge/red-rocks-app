"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DemoUser, Role } from "@/lib/types";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const PENDING_KEY = "red-rocks-google-sign-in";

type PendingSignIn = { nonce: string; role: Role; next: string | null };

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z" />
      <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.8H1.8v3A11.5 11.5 0 0 0 12 23.5z" />
      <path fill="#FBBC05" d="M5.6 14.1a6.9 6.9 0 0 1 0-4.3v-3H1.8a11.5 11.5 0 0 0 0 10.3z" />
      <path fill="#EA4335" d="M12 5c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7 9 5 12 5z" />
    </svg>
  );
}

// Reads the token Google sends back to /login in the URL fragment and has the server verify it.
export async function completeGoogleSignIn() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const credential = fragment.get("id_token");
  if (!credential && !fragment.has("error")) return null;

  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  const saved = window.sessionStorage.getItem(PENDING_KEY);
  window.sessionStorage.removeItem(PENDING_KEY);
  if (!credential || !saved) throw new Error("Google sign-in was cancelled");

  const pending: PendingSignIn = JSON.parse(saved);
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, nonce: pending.nonce }),
  });
  if (!response.ok) throw new Error("Google sign-in failed");

  const user: DemoUser = await response.json();
  return { user, role: pending.role, next: pending.next };
}

// prompt=select_account makes Google show its account chooser on every sign-in.
export function GoogleSignIn({ role, next }: { role: Role; next: string | null }) {
  const [busy, setBusy] = useState(false);

  function start() {
    if (!clientId) return;
    setBusy(true);
    const nonce = crypto.randomUUID();
    try {
      const pending: PendingSignIn = { nonce, role, next };
      window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {
      setBusy(false);
      toast.error("Allow site storage in your browser to use Google sign-in.");
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/login`,
      response_type: "id_token",
      scope: "openid email profile",
      prompt: "select_account",
      nonce,
    });
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={!clientId || busy}
      onClick={start}
    >
      <GoogleLogo />
      {clientId ? "Sign in with Google" : "Google sign-in is not set up yet"}
    </Button>
  );
}
