"use client";

import { useState } from "react";
import { useDemo } from "@/components/demo-provider";
import { Field, Input } from "@/components/ui/input";
import { athletes } from "@/lib/data";
import { isLive } from "@/lib/deals";

function money(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function SponsorResultsPage() {
  const { state } = useDemo();
  const [averageSale, setAverageSale] = useState(12);
  const campaigns = state.offers.filter(isLive);

  const spend = campaigns.reduce((sum, offer) => sum + offer.price, 0);
  const claims = campaigns.reduce((sum, offer) => sum + offer.claims, 0);
  const redemptions = campaigns.reduce((sum, offer) => sum + offer.redemptions, 0);
  const sales = redemptions * (Number.isNaN(averageSale) ? 0 : averageSale);
  const sponsors = new Set(campaigns.map((offer) => offer.sponsorName));
  const repeatSponsors = [...sponsors].filter(
    (name) => campaigns.filter((offer) => offer.sponsorName === name).length > 1,
  );

  const tiles = [
    { label: "Spend", value: money(spend) },
    { label: "Fans who claimed", value: claims.toLocaleString("en-US") },
    { label: "Redeemed in store", value: redemptions.toLocaleString("en-US") },
    { label: "Cost per redemption", value: redemptions ? money(spend / redemptions) : "—" },
    { label: "Estimated sales", value: money(sales) },
    {
      label: "Repeat sponsors",
      value: sponsors.size ? `${Math.round((repeatSponsors.length / sponsors.size) * 100)}%` : "—",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-5xl">Results</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Fans claim a personal code on their VIP Pass. It counts as redeemed when your staff enter it
        on the Redeem page, so you pay only for people who walked in.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border p-4">
            <dd className="font-heading text-3xl font-extrabold text-primary">{tile.value}</dd>
            <dt className="text-sm text-muted-foreground">{tile.label}</dt>
          </div>
        ))}
      </dl>

      <Field label="Your average sale per redemption (USD)" className="mt-6 max-w-xs">
        <Input
          type="number"
          min={0}
          value={Number.isNaN(averageSale) ? "" : averageSale}
          onChange={(event) => setAverageSale(event.target.valueAsNumber)}
        />
      </Field>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="p-3">Campaign</th>
              <th className="p-3">Code</th>
              <th className="p-3 text-right">Spend</th>
              <th className="p-3 text-right">Claimed</th>
              <th className="p-3 text-right">Redeemed</th>
              <th className="p-3 text-right">Cost each</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-muted-foreground">
                  No live campaigns yet.
                </td>
              </tr>
            )}
            {campaigns.map((offer) => (
              <tr key={offer.id} className="border-t">
                <td className="p-3">
                  <p className="font-semibold">{offer.title}</p>
                  <p className="text-muted-foreground">
                    {offer.sponsorName} · {athletes.find((a) => a.id === offer.athleteId)?.name}
                    {offer.sample && " · Sample data"}
                  </p>
                </td>
                <td className="p-3 font-mono">{offer.code}</td>
                <td className="p-3 text-right">{money(offer.price)}</td>
                <td className="p-3 text-right">{offer.claims}</td>
                <td className="p-3 text-right">{offer.redemptions}</td>
                <td className="p-3 text-right">
                  {offer.redemptions ? money(offer.price / offer.redemptions) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Rows marked Sample data are illustrative. Estimated sales use the average sale you enter.
      </p>
    </div>
  );
}
