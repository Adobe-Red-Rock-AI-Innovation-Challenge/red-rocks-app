"use client";

import type { FormEvent } from "react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { businessName } from "@/lib/business";
import { setDemoState } from "@/lib/demo-store";
import type { BusinessProfile } from "@/lib/types";

const industries = ["Food & drink", "Health & fitness", "Retail", "Services", "Other"];

export default function BusinessProfilePage() {
  const { state } = useDemo();
  const profile = state.businessProfile;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = Object.fromEntries(
      ["company", "contact", "phone", "website", "industry", "about"].map((key) => [key, String(form.get(key) ?? "").trim()]),
    ) as BusinessProfile;
    setDemoState((current) => ({
      ...current,
      businessProfile: next,
      user: current.user && { ...current.user, organization: next.company },
    }));
    toast.success("Profile saved");
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">Profile</h1>
      <p className="mt-1 text-muted-foreground">Athletes see this when you send a request.</p>
      {state.user?.status === "pending" && (
        <p className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-900">
          Your account is waiting for approval by the Red Rocks team.
        </p>
      )}
      <form key={profile?.company ?? "new"} onSubmit={save} className="mt-6 grid gap-4 rounded-2xl border p-5 sm:grid-cols-2">
        <Field label="Company / brand name">
          <Input name="company" required maxLength={120} defaultValue={profile?.company ?? businessName(state)} />
        </Field>
        <Field label="Contact person">
          <Input name="contact" maxLength={120} defaultValue={profile?.contact ?? state.user?.name} />
        </Field>
        <Field label="Phone">
          <Input name="phone" type="tel" maxLength={30} defaultValue={profile?.phone} />
        </Field>
        <Field label="Website or social">
          <Input name="website" maxLength={200} defaultValue={profile?.website} />
        </Field>
        <Field label="Industry">
          <Select name="industry" defaultValue={profile?.industry ?? industries[0]}>
            {industries.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field label="Account email">
          <Input value={state.user?.email ?? ""} disabled readOnly />
        </Field>
        <Field label="About your business" className="sm:col-span-2">
          <Textarea name="about" maxLength={600} defaultValue={profile?.about} />
        </Field>
        <Button type="submit" size="lg" className="sm:col-span-2">
          Save profile
        </Button>
      </form>
    </div>
  );
}
