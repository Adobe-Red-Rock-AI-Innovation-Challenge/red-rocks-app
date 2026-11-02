"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { sponsorPackages } from "@/lib/packages";
import { projectRevenue, scenarios, type RevenueInputs } from "@/lib/revenue";

const fields: { key: keyof RevenueInputs; label: string; source: string }[] = [
  { key: "reachableFans", label: "Fans we can reach", source: "Source: 2025 average crowd, Salt Lake Tribune" },
  { key: "paidPercent", label: "Fans who pay (%)", source: "Assumption" },
  { key: "monthlyPrice", label: "Average membership ($/month)", source: "Assumption between the $10 and $25 plans" },
  { key: "monthsPerYear", label: "Paid months per year", source: "Assumption: the season" },
  { key: "fanSharePercent", label: "Share of fan money to athletes (%)", source: "Assumption; needs compliance review" },
  { key: "spotlights", label: `${sponsorPackages[0].name} deals per year`, source: "Assumption" },
  { key: "meetNights", label: `${sponsorPackages[1].name} deals per year`, source: "Assumption" },
  { key: "teamPackages", label: `${sponsorPackages[2].name} deals per year`, source: "Assumption" },
  { key: "platformFeePercent", label: "Platform fee on sponsor deals (%)", source: "Assumption: covers payments and operations" },
  { key: "athletes", label: "Athletes on the roster", source: "Assumption: check the official roster" },
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
    { label: "Operations and fees", value: money(result.operations) },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Revenue model</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        How much new NIL money the hub could bring in per year. Every input is either sourced or
        marked as an assumption. Change any of them.
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
          <li>Sponsor money = deals × package price. Athletes receive it minus the platform fee.</li>
          <li>Fan money = fans × paying share × monthly price × months. Athletes receive the share you set.</li>
          <li>
            Package prices: {sponsorPackages.map((item) => `${item.name} ${money(item.price)}`).join(", ")}.
          </li>
          <li>Card fees and taxes are not modeled. Totals are estimates, not forecasts.</li>
        </ul>
      </section>
    </div>
  );
}
