"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { CampaignCalendar } from "@/components/campaign-calendar";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import type { AiSource as Source, PlanInput } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import { athletes } from "@/lib/data";
import { newOffer } from "@/lib/deals";
import { notification, setDemoState } from "@/lib/demo-store";
import type { CampaignPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const quickRefines = ["Make it cheaper", "Shorten to 2 months", "More fan engagement", "Add a home-meet moment"];

function money(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export default function CampaignPlannerPage() {
  const router = useRouter();
  const { state } = useDemo();
  const sponsorName = state.user?.organization ?? state.user?.name ?? "Your business";
  const [input, setInput] = useState<PlanInput>({
    sponsorName,
    product: "",
    goal: "",
    audience: "",
    budget: 5000,
    startMonth: new Date().getMonth(),
    monthCount: 4,
    athleteIds: [],
  });
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [instruction, setInstruction] = useState("");
  const [source, setSource] = useState<Source | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const pendingApproval = state.user?.status === "pending";

  function toggleAthlete(id: string) {
    setInput((current) => ({
      ...current,
      athleteIds: current.athleteIds.includes(id)
        ? current.athleteIds.filter((item) => item !== id)
        : [...current.athleteIds, id].slice(-4),
    }));
  }

  async function suggestAthletes() {
    setBusy("match");
    try {
      const { data } = await askAi("match", {
        need: `${input.product}. ${input.goal}. ${input.audience}`,
        budget: input.budget,
      });
      setInput((current) => ({ ...current, athleteIds: data.matches.map((match) => match.athleteId) }));
      toast.success("AI picked three athletes. Change them if you like.");
    } catch {
      toast.error("Could not suggest athletes. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function research(event: FormEvent) {
    event.preventDefault();
    setBusy("plan");
    try {
      const { data, source: from } = await askAi("plan", { ...input, sponsorName });
      setPlan(data);
      setSource(from);
    } catch {
      toast.error("Could not build the plan. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function refine(text: string) {
    if (!plan || !text.trim()) return;
    setBusy("refine");
    try {
      const { data, source: from } = await askAi("refine", { plan, instruction: text.trim() });
      setPlan(data);
      setSource(from);
      setInstruction("");
      toast.success("Plan updated");
    } catch {
      toast.error("Could not refine the plan. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function copyBrief() {
    if (!plan) return;
    const brief = [
      `Big idea: ${plan.bigIdea}`,
      ...plan.phases.map((phase) => `${phase.name}: ${phase.keyHook}`),
      "Every post carries #ad.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(brief);
      toast.success("Creative brief copied. Paste it into Adobe Express.");
    } catch {
      toast("Copy the brief by hand, then design it in Adobe Express.");
    }
    window.open("https://new.express.adobe.com/", "_blank", "noopener");
  }

  // Each chosen athlete gets an offer for an equal share of the athlete-fee budget line.
  function sendOffers() {
    if (!plan) return;
    const team = athletes.filter((athlete) => input.athleteIds.includes(athlete.id));
    if (team.length === 0) {
      toast.error("Pick at least one athlete first.");
      return;
    }
    const athleteBudget =
      plan.budget.find((line) => /athlete/i.test(line.item))?.amount ?? Math.round(input.budget * 0.7);
    const share = Math.round(athleteBudget / team.length);
    const athleteWork = plan.rows
      .filter((row) => row.group === "Athletes")
      .flatMap((row) => row.items.map((item) => item.text))
      .join("; ");
    const timeline = `${plan.months[0]} to ${plan.months.at(-1)}`;
    const offers = team.map((athlete) =>
      newOffer({
        sponsorName,
        athleteId: athlete.id,
        title: `${sponsorName} campaign: ${plan.phases[0]?.keyHook ?? "NIL campaign"}`.slice(0, 110),
        deliverables: athleteWork || plan.bigIdea,
        price: share,
        timeline,
        caption: `${plan.bigIdea.slice(0, 120)} #ad`,
      }),
    );

    setDemoState((current) => ({
      ...current,
      offers: [...offers, ...current.offers],
      campaigns: [
        { id: crypto.randomUUID(), sponsorName, athleteIds: input.athleteIds, plan, createdAt: new Date().toISOString() },
        ...current.campaigns,
      ],
      notifications: [
        notification(`Campaign offers sent to ${team.length} athletes`, "/business/requests"),
        ...current.notifications,
      ],
    }));
    toast.success(`Offers sent to ${team.length} athletes`);
    router.push("/business/requests");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Campaign planner</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Tell us about your business. AI researches the fit, picks athletes and lays out a full
        campaign calendar you can refine.
      </p>

      <form onSubmit={research} className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border p-5 md:grid-cols-2">
        <Field label="What are you promoting?">
          <Input
            required
            maxLength={120}
            value={input.product}
            onChange={(event) => setInput({ ...input, product: event.target.value })}
            placeholder="Our new post-workout smoothie"
          />
        </Field>
        <Field label="Who do you want to reach?">
          <Input
            maxLength={160}
            value={input.audience}
            onChange={(event) => setInput({ ...input, audience: event.target.value })}
            placeholder="Families and students near campus"
          />
        </Field>
        <Field label="Goal" className="md:col-span-2">
          <Textarea
            required
            maxLength={400}
            className="min-h-16"
            value={input.goal}
            onChange={(event) => setInput({ ...input, goal: event.target.value })}
            placeholder="Bring 300 new customers into our Sugar House store this season."
          />
        </Field>
        <div className="grid grid-cols-3 gap-3 md:col-span-2">
          <Field label="Budget (USD)">
            <Input
              type="number"
              min={500}
              required
              value={Number.isNaN(input.budget) ? "" : input.budget}
              onChange={(event) => setInput({ ...input, budget: event.target.valueAsNumber })}
            />
          </Field>
          <Field label="Start">
            <Select value={input.startMonth} onChange={(event) => setInput({ ...input, startMonth: Number(event.target.value) })}>
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Months">
            <Select value={input.monthCount} onChange={(event) => setInput({ ...input, monthCount: Number(event.target.value) })}>
              {[2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Athletes (up to 4)</p>
            <Button type="button" variant="outline" disabled={busy !== null || !input.product} onClick={suggestAthletes}>
              ✨ {busy === "match" ? "Finding..." : "Suggest athletes"}
            </Button>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {athletes.map((athlete) => {
              const selected = input.athleteIds.includes(athlete.id);
              return (
                <button
                  key={athlete.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleAthlete(athlete.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm",
                    selected ? "border-primary bg-primary text-white" : "bg-white",
                  )}
                >
                  <Image src={athlete.image} alt="" width={28} height={28} className="size-7 rounded-full object-cover object-top" />
                  {athlete.name}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" size="lg" disabled={busy !== null} className="md:col-span-2">
          {busy === "plan" ? "Researching and planning..." : "Research and plan my campaign"}
        </Button>
      </form>

      {plan && (
        <div className="mt-10 grid grid-cols-1 gap-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl sm:text-3xl">Your campaign</h2>
            {source && <AiSource source={source} />}
          </div>
          <CampaignCalendar plan={plan} />

          <section className="rounded-2xl border p-5">
            <h3 className="text-xl">Refine with AI</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickRefines.map((item) => (
                <Button key={item} variant="outline" disabled={busy !== null} onClick={() => refine(item)}>
                  {item}
                </Button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                refine(instruction);
              }}
              className="mt-3 flex flex-wrap gap-2"
            >
              <Input
                aria-label="Your change"
                className="min-w-0 flex-1 basis-64"
                maxLength={300}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder="Move the meet-day table to February and add a TikTok challenge"
              />
              <Button type="submit" disabled={busy !== null || !instruction.trim()}>
                {busy === "refine" ? "Updating..." : "Update plan"}
              </Button>
            </form>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border p-5">
              <h3 className="text-xl">Research</h3>
              <p className="mt-2 text-sm">
                <strong>Audience insight:</strong> {plan.research.audienceInsight}
              </p>
              <p className="mt-2 text-sm">
                <strong>Why these athletes:</strong> {plan.research.whyTheseAthletes}
              </p>
              <p className="mt-4 text-sm font-semibold">Sourced facts</p>
              <ul className="mt-1 grid list-disc gap-1 pl-5 text-sm">
                {plan.research.facts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold">Assumptions to test</p>
              <ul className="mt-1 grid list-disc gap-1 pl-5 text-sm text-muted-foreground">
                {plan.research.assumptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold">Risks and compliance</p>
              <ul className="mt-1 grid list-disc gap-1 pl-5 text-sm">
                {plan.research.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="grid content-start gap-4">
              <div className="rounded-2xl border p-5">
                <h3 className="text-xl">Budget</h3>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {plan.budget.map((line) => (
                      <tr key={line.item} className="border-t">
                        <td className="py-1.5">{line.item}</td>
                        <td className="py-1.5 text-right font-semibold">{money(line.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t font-bold">
                      <td className="py-1.5">Total</td>
                      <td className="py-1.5 text-right">{money(plan.budget.reduce((sum, line) => sum + line.amount, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border p-5">
                <h3 className="text-xl">Success measures</h3>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
                  {plan.kpis.map((kpi) => (
                    <div key={kpi.metric} className="rounded-lg bg-neutral-50 p-2">
                      <dd className="font-bold text-primary">{kpi.target}</dd>
                      <dt className="text-xs text-muted-foreground">{kpi.metric}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" size="lg" onClick={copyBrief}>
              Design the creative in Adobe Express
            </Button>
            <Button size="lg" disabled={pendingApproval} onClick={sendOffers}>
              Send offers to {input.athleteIds.length || "selected"} athletes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
