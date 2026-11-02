"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import type { AiOutput, AiSource as Source } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import { athletes, sponsors } from "@/lib/data";
import { notification, setDemoState } from "@/lib/demo-store";

type Draft = AiOutput<"campaign"> & { athleteId: string };

export default function SponsorPage() {
  const { state } = useDemo();
  const [sponsorName, setSponsorName] = useState(sponsors[0].name);
  const [need, setNeed] = useState("");
  const [budget, setBudget] = useState(1500);
  const [matches, setMatches] = useState<AiOutput<"match">["matches"] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // A sign-up organization that is not in the seed list still sponsors under its own name.
  const organization = state.user?.organization;
  const sponsorOptions = [
    ...(organization && !sponsors.some((item) => item.name === organization) ? [organization] : []),
    ...sponsors.map((item) => item.name),
  ];

  async function findMatches(event: FormEvent) {
    event.preventDefault();
    setBusy("match");
    setDraft(null);
    try {
      const { data, source: from } = await askAi("match", { need, budget });
      setMatches(data.matches);
      setSource(from);
    } catch {
      toast.error("Could not find matches. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function generateDraft(athleteId: string) {
    setBusy(athleteId);
    try {
      const { data, source: from } = await askAi("campaign", {
        sponsorName,
        need,
        budget,
        athleteId,
      });
      setDraft({ ...data, athleteId });
      setSource(from);
    } catch {
      toast.error("Could not write the draft. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function sendOffer() {
    if (!draft) return;
    setDemoState((current) => ({
      ...current,
      offers: [
        {
          ...draft,
          id: crypto.randomUUID(),
          sponsorName,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        ...current.offers,
      ],
      activeAthleteId: draft.athleteId,
      notifications: [
        notification(`New offer from ${sponsorName}`, "/athlete/dashboard"),
        ...current.notifications,
      ],
    }));
    setDraft(null);
    toast.success("Offer sent to the athlete's inbox");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-5xl">Find athletes</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us what you need. AI picks your best three matches.
      </p>

      <form onSubmit={findMatches} className="mt-6 grid gap-4 rounded-lg border p-5 md:grid-cols-3">
        <Field label="Sponsor">
          <Select value={sponsorName} onChange={(event) => setSponsorName(event.target.value)}>
            {sponsorOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Budget (USD)">
          <Input
            type="number"
            required
            min={100}
            value={Number.isNaN(budget) ? "" : budget}
            onChange={(event) => setBudget(event.target.valueAsNumber)}
          />
        </Field>
        <Field label="What do you need?" className="md:col-span-3">
          <Textarea
            required
            maxLength={1000}
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            placeholder="Promote our new post-workout smoothie to local students who love the outdoors."
          />
        </Field>
        <Button type="submit" size="lg" disabled={busy !== null} className="md:col-span-3">
          {busy === "match" ? "Matching..." : "Find my top 3"}
        </Button>
      </form>

      {matches && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl">Top matches</h2>
            {source && <AiSource source={source} />}
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {matches.map((match) => {
              const athlete = athletes.find((item) => item.id === match.athleteId);
              return (
                <article key={match.athleteId} className="flex flex-col rounded-lg border p-4">
                  <p className="font-heading text-4xl font-extrabold text-primary">
                    {match.score}%
                  </p>
                  <h3 className="text-xl">{athlete?.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{match.reason}</p>
                  <Button
                    className="mt-3"
                    variant={draft?.athleteId === match.athleteId ? "outline" : "default"}
                    disabled={busy !== null}
                    onClick={() => generateDraft(match.athleteId)}
                  >
                    {busy === match.athleteId ? "Writing..." : "Generate Campaign Draft"}
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {draft && (
        <section className="mt-8 grid gap-4 rounded-lg border p-5">
          <h2 className="text-2xl">Campaign draft</h2>
          <Field label="Title">
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </Field>
          <Field label="Content">
            <Textarea
              value={draft.deliverables}
              onChange={(event) => setDraft({ ...draft, deliverables: event.target.value })}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Price (USD)">
              <Input
                type="number"
                min={0}
                value={Number.isNaN(draft.price) ? "" : draft.price}
                onChange={(event) => setDraft({ ...draft, price: event.target.valueAsNumber })}
              />
            </Field>
            <Field label="Timeline">
              <Input
                value={draft.timeline}
                onChange={(event) => setDraft({ ...draft, timeline: event.target.value })}
              />
            </Field>
          </div>
          <Field label="Caption">
            <Input
              value={draft.caption}
              onChange={(event) => setDraft({ ...draft, caption: event.target.value })}
            />
          </Field>
          <Button size="lg" disabled={Number.isNaN(draft.price)} onClick={sendOffer}>
            Send offer
          </Button>
        </section>
      )}
    </div>
  );
}
