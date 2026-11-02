"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { athletes } from "@/lib/data";
import { newOffer } from "@/lib/deals";
import { notification, setDemoState } from "@/lib/demo-store";
import type { SponsorRequest } from "@/lib/types";

export default function SponsorRequestsPage() {
  const router = useRouter();
  const { state } = useDemo();
  const sponsorName = state.user?.organization ?? state.user?.name ?? "Your business";
  const pendingApproval = state.user?.status === "pending";

  function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request: SponsorRequest = {
      id: crypto.randomUUID(),
      sponsorName,
      title: String(form.get("title")).trim(),
      service: String(form.get("service")).trim(),
      date: String(form.get("date")),
      budget: Number(form.get("budget")),
      details: String(form.get("details")).trim(),
      status: "open",
      responses: [],
      createdAt: new Date().toISOString(),
    };
    setDemoState((current) => ({
      ...current,
      requests: [request, ...current.requests],
      notifications: [
        notification(`New opportunity: ${request.title}`, "/athlete/opportunities"),
        ...current.notifications,
      ],
    }));
    event.currentTarget.reset();
    toast.success("Posted. Athletes can now say they're interested.");
  }

  function choose(request: SponsorRequest, athleteId: string) {
    const offer = newOffer({
      sponsorName: request.sponsorName,
      athleteId,
      title: request.title,
      deliverables: `${request.service}. ${request.details}`,
      price: request.budget,
      timeline: `On ${request.date}`,
      caption: `Come see us at ${request.sponsorName}! #ad`,
    });
    setDemoState((current) => ({
      ...current,
      offers: [offer, ...current.offers],
      requests: current.requests.map((item) =>
        item.id === request.id ? { ...item, status: "filled" } : item,
      ),
      notifications: [
        notification(`You were picked for "${request.title}"`, "/athlete/dashboard"),
        ...current.notifications,
      ],
    }));
    toast.success("Offer sent");
    router.push("/sponsor/deals");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-5xl">Requests</h1>
      <p className="mt-2 text-muted-foreground">
        Post what you need. Athletes who are free and interested raise their hand.
      </p>

      <form onSubmit={post} className="mt-6 grid gap-4 rounded-lg border p-5 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2">
          <Input name="title" required maxLength={120} placeholder="Grand opening appearance" />
        </Field>
        <Field label="Service">
          <Input name="service" required maxLength={120} placeholder="In-person appearance (1 hr)" />
        </Field>
        <Field label="Date">
          <Input name="date" type="date" required />
        </Field>
        <Field label="Budget (USD)">
          <Input name="budget" type="number" min={50} required defaultValue={500} />
        </Field>
        <Field label="Details" className="sm:col-span-2">
          <Textarea name="details" required maxLength={600} />
        </Field>
        <Button type="submit" size="lg" disabled={pendingApproval} className="sm:col-span-2">
          Post request
        </Button>
      </form>

      <div className="mt-8 grid gap-4">
        {state.requests.map((request) => (
          <article key={request.id} className="rounded-lg border p-5">
            <p className="text-sm font-semibold text-primary">{request.sponsorName}</p>
            <h2 className="text-2xl">{request.title}</h2>
            <p className="text-sm text-muted-foreground">
              {request.service} · {request.date} · ${request.budget.toLocaleString("en-US")}
            </p>
            <h3 className="mt-4 text-base">
              {request.status === "filled"
                ? "Filled"
                : `${request.responses.length} interested`}
            </h3>
            <div className="mt-2 grid gap-2">
              {request.responses.map((response) => {
                const athlete = athletes.find((item) => item.id === response.athleteId);
                return (
                  <div
                    key={response.athleteId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-neutral-50 p-3"
                  >
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="font-semibold">{athlete?.name}</p>
                      <p className="text-sm text-muted-foreground">&ldquo;{response.note}&rdquo;</p>
                    </div>
                    {request.status === "open" && (
                      <Button onClick={() => choose(request, response.athleteId)}>
                        Choose {athlete?.name.split(" ")[0]}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
