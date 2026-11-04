"use client";

import { useState } from "react";
import { ArrowRight, Building2, HeartHandshake, UsersRound } from "lucide-react";
import { BusinessQuotes } from "@/components/business-quotes";
import { SeasonGoal } from "@/components/season-goal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { SERVICE_FEE_PERCENT, sponsorPackages } from "@/lib/packages";
import { projectRevenue, scenarios, type RevenueInputs } from "@/lib/revenue";
import { WRTH_SOURCE, wrthStats } from "@/lib/wrth";

const fields: { key: keyof RevenueInputs; label: string; source: string }[] = [
  { key: "existingDonors", label: "Current WRTH donors", source: `Source: ${WRTH_SOURCE}` },
  { key: "reachableFans", label: "New fans we can reach", source: "Source: 2025 average crowd, Salt Lake Tribune" },
  { key: "paidPercent", label: "New fans who join (%)", source: "Assumption" },
  { key: "monthlyPrice", label: "Average membership ($/month)", source: "Assumption between WRTH's $10 duo and $25 family plans" },
  { key: "monthsPerYear", label: "Paid months per year", source: "Assumption: the season" },
  { key: "fanSharePercent", label: "Share of fan money to athletes (%)", source: "WRTH promise: 100% of contributions" },
  { key: "spotlights", label: `${sponsorPackages[0].name} deals per year`, source: "Assumption" },
  { key: "meetNights", label: `${sponsorPackages[1].name} deals per year`, source: "Assumption" },
  { key: "teamPackages", label: `${sponsorPackages[2].name} deals per year`, source: "Assumption" },
  { key: "serviceFeePercent", label: "Service fee sponsors pay on top (%)", source: "Assumption: runs the hub" },
  { key: "athletes", label: "Athletes on the roster", source: "Source: official Utah roster" },
];

const flow = [
  {
    icon: UsersRound,
    title: "Fans",
    lines: ["$10 duo and $25 family memberships", "One-time gifts and Quests", "Athlete gifts and shout-outs"],
    note: "100% of contributions reach athletes, minus card processing.",
  },
  {
    icon: Building2,
    title: "Sponsors",
    lines: ["NIL deals priced by each athlete's own quote", "Team and meet-night packages", "Tracked offers fans redeem in store"],
    note: `Athletes keep 100% of the quote. Sponsors add a ${SERVICE_FEE_PERCENT}% service fee that runs the hub.`,
  },
];

function money(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function ImpactPage() {
  const [scenario, setScenario] = useState("Base");
  const [inputs, setInputs] = useState<RevenueInputs>(scenarios.Base);
  const result = projectRevenue(inputs);

  const outputs = [
    { label: "NIL dollars to athletes", value: money(result.athleteDollars) },
    { label: "Per athlete", value: money(result.perAthlete) },
    { label: "From sponsors", value: money(result.sponsorRevenue) },
    { label: "From fans", value: money(result.fanRevenue) },
    { label: "Paying members", value: result.members.toLocaleString("en-US") },
    { label: "Service fees for operations", value: money(result.operations) },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">WRTH money flow</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Where every dollar comes from and where it goes. The hub turns Red Rocks&apos; audience into
        NIL money for every athlete, the way Who Rocks the House already works.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {wrthStats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-black p-4 text-white">
            <dd className="text-3xl font-extrabold text-primary">{item.value}</dd>
            <dt className="text-sm text-white/80">{item.label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">Source: {WRTH_SOURCE}.</p>

      <section aria-label="Money flow" className="mt-8 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="grid gap-4">
          {flow.map((item) => (
            <article key={item.title} className="rounded-2xl border p-5">
              <h2 className="flex items-center gap-2 text-2xl">
                <item.icon className="size-6 text-primary" /> {item.title}
              </h2>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
                {item.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-primary">{item.note}</p>
            </article>
          ))}
        </div>
        <ArrowRight className="mx-auto size-10 rotate-90 text-primary lg:rotate-0" aria-hidden="true" />
        <article className="rounded-2xl bg-primary p-6 text-white">
          <h2 className="flex items-center gap-2 text-2xl">
            <HeartHandshake className="size-6" /> Every Red Rocks athlete
          </h2>
          <p className="mt-2 text-sm text-white/90">
            Team-wide: packages spread across the roster, so every gymnast earns, not only the most
            followed.
          </p>
          <p className="mt-4 text-5xl font-extrabold">{money(result.athleteDollars)}</p>
          <p className="text-sm text-white/90">per year in the {scenario} scenario below</p>
        </article>
      </section>

      <BusinessQuotes />

      <div className="mt-12">
        <SeasonGoal />
      </div>

      <h2 className="mt-12 text-3xl">Revenue model</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every input is sourced or marked as an assumption. Change any of them.
      </p>

      <div role="group" aria-label="Scenario" className="mt-6 flex flex-wrap gap-2">
        {Object.keys(scenarios).map((name) => (
          <Button
            key={name}
            variant={scenario === name ? "default" : "outline"}
            aria-pressed={scenario === name}
            onClick={() => {
              setScenario(name);
              setInputs(scenarios[name]);
            }}
          >
            {name}
          </Button>
        ))}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {outputs.map((item, index) => (
          <div
            key={item.label}
            className={index === 0 ? "rounded-lg bg-primary p-4 text-white" : "rounded-lg border p-4"}
          >
            <dd className="font-heading text-3xl font-extrabold">{item.value}</dd>
            <dt className={index === 0 ? "text-sm text-red-100" : "text-sm text-muted-foreground"}>
              {item.label}
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <Field key={field.key} label={field.label}>
            <Input
              type="number"
              min={0}
              value={Number.isNaN(inputs[field.key]) ? "" : inputs[field.key]}
              onChange={(event) => {
                setScenario("Custom");
                setInputs({ ...inputs, [field.key]: event.target.valueAsNumber || 0 });
              }}
            />
            <span className="text-xs font-normal text-muted-foreground">{field.source}</span>
          </Field>
        ))}
      </div>

      <section className="mt-10 rounded-lg bg-neutral-50 p-5 text-sm">
        <h2 className="text-2xl">How this is calculated</h2>
        <ul className="mt-3 grid list-disc gap-1 pl-5">
          <li>Sponsor money = deals × package price. Athletes keep all of it; the service fee is added on top.</li>
          <li>Fan money = (current donors + new fans × join rate) × monthly price × months. Athletes receive the share you set.</li>
          <li>
            Package prices: {sponsorPackages.map((item) => `${item.name} ${money(item.price)}`).join(", ")}.
          </li>
          <li>Card fees and taxes are not modeled. Totals are estimates, not forecasts.</li>
        </ul>
      </section>
    </div>
  );
}
