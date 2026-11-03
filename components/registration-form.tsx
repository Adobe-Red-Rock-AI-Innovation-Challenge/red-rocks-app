"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { registrationForms } from "@/lib/registration";
import type { DemoUser, PartnerRole } from "@/lib/types";

// Shown once after a new Gmail signs in: the form changes with the role they pick.
export function RegistrationForm({
  user,
  onDone,
}: {
  user: DemoUser;
  onDone: (role: PartnerRole) => void;
}) {
  const [role, setRole] = useState<PartnerRole>("sponsor");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const profile = Object.fromEntries(
      registrationForms[role].map((field) => [field.key, String(form.get(field.key) ?? "")]),
    );

    setBusy(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name: form.get("name"), profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not register");
      toast.success("Thanks! An admin will approve your account soon.");
      onDone(data.role);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div role="group" aria-label="I am a" className="grid grid-cols-2 gap-2">
        {(["sponsor", "athlete"] as const).map((item) => (
          <Button
            key={item}
            type="button"
            size="lg"
            variant={role === item ? "default" : "outline"}
            aria-pressed={role === item}
            onClick={() => setRole(item)}
          >
            {item === "sponsor" ? "I'm a sponsor" : "I'm a Red Rocks athlete"}
          </Button>
        ))}
      </div>
      <Field label={role === "sponsor" ? "Contact name" : "Full name"}>
        <Input name="name" required defaultValue={user.name} autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input value={user.email} disabled readOnly />
      </Field>
      {registrationForms[role].map((field) => (
        <Field key={`${role}-${field.key}`} label={`${field.label}${field.required ? "" : " (optional)"}`}>
          {field.type === "select" ? (
            <Select name={field.key} required={field.required} defaultValue="">
              <option value="" disabled={field.required}>
                Choose one
              </option>
              {field.options?.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          ) : (
            <Input
              name={field.key}
              type={field.type ?? "text"}
              required={field.required}
              placeholder={field.placeholder}
              maxLength={200}
            />
          )}
        </Field>
      ))}
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Sending..." : "Request access"}
      </Button>
      <p className="text-xs text-muted-foreground">
        {role === "athlete"
          ? "A team admin checks that you are on the roster before you can accept deals."
          : "An admin approves new sponsors before offers go out."}
      </p>
    </form>
  );
}
