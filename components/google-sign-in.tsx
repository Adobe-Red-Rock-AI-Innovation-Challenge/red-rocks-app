"use client";

import Script from "next/script";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { DemoUser } from "@/lib/types";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleIdentity = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

function userFromCredential(credential: string): DemoUser {
  const payload = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
  const claims = JSON.parse(new TextDecoder().decode(bytes));
  return { name: claims.name, email: claims.email, picture: claims.picture, provider: "google" };
}

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

// Google Identity Services runs once a client ID is set; until then the button signs in a demo user.
export function GoogleSignIn({ onUser }: { onUser: (user: DemoUser) => void }) {
  const slot = useRef<HTMLDivElement>(null);

  if (!clientId) {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() =>
          onUser({ name: "Demo Fan", email: "demo.fan@gmail.com", provider: "google" })
        }
      >
        <GoogleLogo />
        Sign in with Google (demo)
      </Button>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => {
          const identity = window.google?.accounts.id;
          if (!identity || !slot.current) return;
          identity.initialize({
            client_id: clientId,
            callback: ({ credential }) => onUser(userFromCredential(credential)),
          });
          identity.renderButton(slot.current, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            width: 320,
          });
        }}
      />
      <div ref={slot} className="flex min-h-10 justify-center" />
    </>
  );
}
