"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { GoogleSignIn } from "@/components/google-sign-in";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { signIn } from "@/lib/demo-store";
import { roles } from "@/lib/roles";
import type { DemoUser, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

// Only same-site paths are followed, so a crafted ?next= link cannot send people elsewhere.
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : null;
}

export default function LoginPage() {
  const router = useRouter();
  const { state } = useDemo();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<Role>("fan");

  function finish(user: DemoUser, chosenRole?: Role) {
    signIn(user, chosenRole);
    toast.success(`Welcome, ${user.name}`);
    const home = roles.find((item) => item.id === (chosenRole ?? state.role))?.home ?? "/";
    router.push(nextPath() ?? home);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();

    if (mode === "signup") {
      const organization = String(form.get("organization")).trim();
      finish(
        {
          name: String(form.get("name")).trim(),
          email,
          organization: organization || undefined,
          provider: "email",
        },
        role,
      );
      return;
    }

    const account = state.accounts.find((item) => item.email === email);
    finish(account ?? { name: email.split("@")[0], email, provider: "email" });
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-4xl">{mode === "signin" ? "Sign in" : "Create account"}</h1>

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

      <div className="mt-6">
        <GoogleSignIn onUser={(user) => finish(user, mode === "signup" ? role : undefined)} />
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
            <Field label="I am a">
              <Select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                {roles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
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
        Prototype only: accounts stay in this browser and passwords are never checked or saved.
        Use a made-up password.
      </p>
    </div>
  );
}
