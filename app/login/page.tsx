"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { toast } from "sonner";
import { completeGoogleSignIn, GoogleSignIn } from "@/components/google-sign-in";
import { RegistrationForm } from "@/components/registration-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { setDemoState, signIn } from "@/lib/demo-store";
import { roles } from "@/lib/roles";
import type { DemoUser, Membership, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const noSubscription = () => () => {};

const audiences: { role: Role; label: string }[] = [
  { role: "sponsor", label: "Business Partner" },
  { role: "fan", label: "Red Rock Nation" },
  { role: "athlete", label: "Athlete" },
];

// A fan's name goes on their VIP Pass; a demo fan account also arrives with its membership.
function startFan(user: DemoUser, demoMembership: Membership | null) {
  setDemoState((current) => ({
    ...current,
    role: "fan",
    fan: { name: user.name, email: user.email },
    membership: demoMembership ?? current.membership,
  }));
}

function homeFor(role: Role) {
  if (role === "fan") return "/fan/dashboard";
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
  const params = new URLSearchParams(search);

  // Only same-site paths are followed, so a crafted ?next= link cannot send people elsewhere.
  const nextParam = params.get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
  const roleParam = params.get("role");

  const [picked, setPicked] = useState<Role | null>(null);
  const audience = picked ?? (roleParam === "athlete" || roleParam === "fan" ? roleParam : "sponsor");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [registering, setRegistering] = useState<DemoUser | null>(null);

  function finish(user: DemoUser, role: Role, demoMembership: Membership | null = null) {
    signIn(user, role);
    if (role === "fan") startFan(user, demoMembership);
    toast.success(`Welcome, ${user.name}`);
    router.push(next ?? homeFor(role));
  }

  useEffect(() => {
    completeGoogleSignIn()
      .then((result) => {
        if (!result) return;
        signIn(result.user, result.role);
        if (result.role === "fan") startFan(result.user, result.demoMembership);
        if (result.needsRegistration) {
          setRegistering(result.user);
          return;
        }
        toast.success(`Welcome, ${result.user.name}`);
        router.push(result.next ?? homeFor(result.role));
      })
      .catch((error: Error) => toast.error(error.message));
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (mode === "signup" && form.get("password") !== form.get("confirm")) {
      toast.error("The passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          role: audience,
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not sign in");
      finish(data.user, data.role, data.demoMembership);
      if (data.user.status === "pending") toast("Your account is waiting for admin approval.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (registering) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="text-4xl">Create your account</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Tell us who you are. The form changes for sponsors and athletes.
        </p>
        <RegistrationForm
          user={registering}
          onDone={(role) => {
            signIn({ ...registering, status: "pending" }, role);
            router.push(homeFor(role));
          }}
        />
      </div>
    );
  }

  const isAthlete = audience === "athlete";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-4xl">Get involved</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose who you are, then sign in.</p>

      <div role="tablist" aria-label="I am" className="mt-6 grid grid-cols-3 gap-1 rounded-full bg-neutral-100 p-1">
        {audiences.map((item) => (
          <button
            key={item.role}
            type="button"
            role="tab"
            aria-selected={audience === item.role}
            onClick={() => setPicked(item.role)}
            className={cn(
              "rounded-full px-2 py-2 text-xs sm:text-sm",
              audience === item.role ? "bg-primary text-white" : "text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form key={`${audience}-${mode}`} onSubmit={submit} className="mt-6 grid gap-4">
        {mode === "signup" && (
          <Field label="Full name">
            <Input name="name" required autoComplete="name" maxLength={120} />
          </Field>
        )}
        <Field label={isAthlete ? "Umail" : "Email"}>
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={isAthlete ? "u1234567@umail.utah.edu" : "you@example.com"}
            pattern={isAthlete ? ".+@umail\\.utah\\.edu" : undefined}
            title={isAthlete ? "Use your @umail.utah.edu address" : undefined}
          />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </Field>
        {mode === "signup" && (
          <Field label="Confirm password">
            <Input name="confirm" type="password" required minLength={8} autoComplete="new-password" />
          </Field>
        )}
        <Button type="submit" size="lg" disabled={busy} className="h-11">
          {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        {mode === "signup" && audience !== "fan" && (
          <p className="text-xs text-muted-foreground">
            {isAthlete ? "Athlete" : "Business"} accounts are approved by the Red Rocks team before
            deals go out.
          </p>
        )}
      </form>

      {!isAthlete && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleSignIn next={next} />
        </>
      )}

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        explore without an account
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
