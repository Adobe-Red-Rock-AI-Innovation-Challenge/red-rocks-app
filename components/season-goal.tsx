"use client";

import { useDemo } from "@/components/demo-provider";
import { athleteCampaignDollars } from "@/lib/athlete-campaigns";
import { plans } from "@/lib/checkout";
import { isLive } from "@/lib/deals";
import { DEFAULT_SCENARIO, NIL_GOAL, QUARTER_MILESTONES, scenarios } from "@/lib/revenue";

// The goal is the $2M Plan, so the bar, /impact and the slides tell the same story.
const FAN_SHARE = scenarios[DEFAULT_SCENARIO].fanSharePercent / 100;

function short(value: number) {
  return value >= 1_000_000 ? `$${value / 1_000_000}M` : `$${value / 1000}K`;
}

export function SeasonGoal() {
  const { state } = useDemo();

  const sponsorDollars = state.offers
    .filter((offer) => offer.status === "paid" || offer.status === "reported")
    .reduce((sum, offer) => sum + offer.price, 0);
  const fanPayments =
    (state.membership ? plans[state.membership].price : 0) +
    state.giftDollars +
    Object.values(state.questContributions).reduce((sum, amount) => sum + amount, 0);
  // Signed drops are sales too, but they count once, under athlete campaigns.
  const giftShares = state.sales
    .filter((sale) => !sale.productId.startsWith("drop:"))
    .reduce((sum, sale) => sum + sale.athleteShare, 0);
  const campaignDollars = athleteCampaignDollars(state);
  const raised = Math.round(sponsorDollars + campaignDollars + fanPayments * FAN_SHARE + giftShares);
  const streams = [
    { label: "Sponsors", value: sponsorDollars },
    { label: "Athlete campaigns", value: campaignDollars },
    { label: "Fans and gifts", value: fanPayments * FAN_SHARE + giftShares },
  ];
  const percent = Math.min(100, (raised / NIL_GOAL) * 100);
  const liveCampaigns = state.offers.filter(isLive).length;

  return (
    <div className="rounded-lg border bg-white p-5 text-foreground">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">NIL dollars raised this season</p>
          <p className="font-heading text-4xl font-extrabold text-primary">
            ${raised.toLocaleString("en-US")}
            <span className="text-lg text-muted-foreground"> of ${NIL_GOAL.toLocaleString("en-US")}</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{liveCampaigns} sponsor campaigns live</p>
      </div>
      <div
        role="progressbar"
        aria-label="Season NIL goal"
        aria-valuenow={Math.round(percent * 10) / 10}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-200"
      >
        <div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${percent}%` }} />
      </div>
      <ol aria-label="Quarterly milestones" className="mt-2 grid grid-cols-4 gap-2 text-xs">
        {QUARTER_MILESTONES.map((milestone, index) => (
          <li key={milestone} className={raised >= milestone ? "font-bold text-primary" : "text-muted-foreground"}>
            Q{index + 1}: {short(milestone)}
          </li>
        ))}
      </ol>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        {streams.map((stream) => (
          <div key={stream.label}>
            <dt className="text-xs text-muted-foreground">{stream.label}</dt>
            <dd className="font-bold">${Math.round(stream.value).toLocaleString("en-US")}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        Counts paid sponsor deals, booked athlete clinics and signed drops, the athletes&apos; share of fan
        payments and gift sales. Goal and quarterly
        milestones come from the $2M Plan revenue model. Demo counter: it starts from sample deals and grows with each payment
        in this browser.
      </p>
    </div>
  );
}
