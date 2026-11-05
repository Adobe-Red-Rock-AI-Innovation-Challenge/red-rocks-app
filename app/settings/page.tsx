"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { signIn } from "@/lib/demo-store";

export default function SettingsPage() {
  const { state } = useDemo();
  const { user } = state;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const organization = String(form.get("organization")).trim();
    signIn({
      ...user,
      name: String(form.get("name")).trim(),
      organization: organization || undefined,
    });
    toast.success("Settings saved");
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="mb-6 text-4xl">Settings</h1>
      {user ? (
        <form key={user.email} onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Full name">
            <Input name="name" required defaultValue={user.name} autoComplete="name" />
          </Field>
          <Field label="Organization">
            <Input
              name="organization"
              defaultValue={user.organization}
              autoComplete="organization"
            />
          </Field>
          <Field label="Email">
            <Input value={user.email} disabled readOnly />
          </Field>
          <Button type="submit" size="lg">
            Save changes
          </Button>
          {state.role === "athlete" && (
            <Link href="/athlete/setup" className="rounded-xl border p-4 text-sm hover:border-primary">
              <span className="block font-semibold">Athlete profile</span>
              <span className="text-muted-foreground">Your bio, tags and rate card, with AI help.</span>
            </Link>
          )}
        </form>
      ) : (
        <SignInPrompt next="/settings" message="Sign in to change your account." />
      )}
    </div>
  );
}
