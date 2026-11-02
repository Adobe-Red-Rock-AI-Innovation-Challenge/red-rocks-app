"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { completeGoogleSignIn, GoogleSignIn } from "@/components/google-sign-in";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/demo-store";
import { roles } from "@/lib/roles";
import type { Role } from "@/lib/types";

const noSubscription = () => () => {};

function homeFor(role: Role) {
  return roles.find((item) => item.id === role)?.home ?? "/";
}

const demoAccounts = [
  { role: "sponsor" as const, name: "Demo Sponsor", organization: "Sego Smoothie Co." },
  { role: "athlete" as const, name: "Demo Athlete", organization: "Red Rocks" },
];

export default function LoginPage() {
  const router = useRouter();
  const search = useSyncExternalStore(
    noSubscription,
    () => window.location.search,
    () => "",
  );

  // Only same-site paths are followed, so a crafted ?next= link cannot send people elsewhere.
  const nextParam = new URLSearchParams(search).get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  useEffect(() => {
    completeGoogleSignIn()
      .then((result) => {
        if (!result) return;
        signIn(result.user, result.role);
        toast.success(`Welcome, ${result.user.name}`);
        router.push(result.next ?? homeFor(result.role));
      })
      .catch((error: Error) => toast.error(error.message));
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-4xl">Partner sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        For sponsors and athletes. Fans do not need an account.
      </p>

      <div className="mt-6">
        <GoogleSignIn next={next} />
      </div>
      <ul className="mt-3 grid gap-1 text-xs text-muted-foreground">
        <li>Athletes: use the Gmail your team admin added.</li>
        <li>Sponsors: any Gmail works. New sponsors are approved by an admin.</li>
      </ul>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or explore without an account
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {demoAccounts.map((account) => (
          <Button
            key={account.role}
            variant="outline"
            size="lg"
            onClick={() => {
              signIn(
                {
                  name: account.name,
                  email: `demo.${account.role}@example.com`,
                  organization: account.organization,
                  provider: "demo",
                },
                account.role,
              );
              router.push(next ?? homeFor(account.role));
            }}
          >
            Demo {account.role}
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Demo accounts use sample data that stays in this browser.
      </p>
    </div>
  );
}
