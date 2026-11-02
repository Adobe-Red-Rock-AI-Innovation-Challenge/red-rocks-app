"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { completeGoogleSignIn, GoogleSignIn } from "@/components/google-sign-in";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { signIn } from "@/lib/demo-store";
import { roles } from "@/lib/roles";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const noSubscription = () => () => {};
const accountRoles = roles.filter((role) => role.id !== "fan");

function homeFor(role: Role) {
  return roles.find((item) => item.id === role)?.home ?? "/";
}

export default function LoginPage() {
  const router = useRouter();
  const { state } = useDemo();
  const search = useSyncExternalStore(
    noSubscription,
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pickedRole, setPickedRole] = useState<Role | null>(null);
  const role =
    pickedRole ??
    (params.get("role") === "athlete" || state.role === "athlete" ? "athlete" : "sponsor");

  // Only same-site paths are followed, so a crafted ?next= link cannot send people elsewhere.
  const nextParam = params.get("next");
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const organization = String(form.get("organization") ?? "").trim();
    const account = state.accounts.find((item) => item.email === email);
    const user =
      mode === "signup"
        ? {
            name: String(form.get("name")).trim(),
            email,
            organization: organization || undefined,
            provider: "email" as const,
          }
        : (account ?? { name: email.split("@")[0], email, provider: "email" as const });

    signIn(user, role);
    toast.success(`Welcome, ${user.name}`);
    router.push(next ?? homeFor(role));
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-4xl">{mode === "signin" ? "Partner sign in" : "Create account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        For sponsors and athletes. Fans do not need an account.
      </p>

      <div role="tablist" aria-label="Account" className="mt-6 flex rounded-lg bg-muted p-1">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Sign up"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors",
              mode === id ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="group" aria-label="I am a" className="mt-4 grid grid-cols-2 gap-2">
        {accountRoles.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={role === item.id ? "default" : "outline"}
            size="lg"
            aria-pressed={role === item.id}
            onClick={() => setPickedRole(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        <GoogleSignIn role={role} next={next} />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or use email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {mode === "signup" && (
          <>
            <Field label="Full name">
              <Input name="name" required autoComplete="name" />
            </Field>
            <Field label="Organization (optional)">
              <Input name="organization" autoComplete="organization" />
            </Field>
          </>
        )}
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </Field>
        <Button type="submit" size="lg">
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        Prototype only: email accounts stay in this browser and passwords are never checked or
        saved. Use a made-up password.
      </p>
    </div>
  );
}
