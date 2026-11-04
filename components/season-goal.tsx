"use client";

import { useDemo } from "@/components/demo-provider";
import { plans } from "@/lib/checkout";
import { isLive } from "@/lib/deals";
import { projectRevenue, scenarios } from "@/lib/revenue";

// The goal is the Base revenue model, so the bar and /impact always tell the same story.
const GOAL = Math.round(projectRevenue(scenarios.Base).athleteDollars / 1000) * 1000;
const FAN_SHARE = scenarios.Base.fanSharePercent / 100;

export function SeasonGoal() {
  const { state } = useDemo();

  const sponsorDollars = state.offers
    .filter((offer) => offer.status === "paid" || offer.status === "reported")
    .reduce((sum, offer) => sum + offer.price, 0);
  const fanPayments =
    (state.membership ? plans[state.membership].price : 0) +
    state.giftDollars +
    Object.values(state.questContributions).reduce((sum, amount) => sum + amount, 0);
  const giftShares = state.sales.reduce((sum, sale) => sum + sale.athleteShare, 0);
  const raised = Math.round(sponsorDollars + fanPayments * FAN_SHARE + giftShares);
  const percent = Math.min(100, (raised / GOAL) * 100);
  const liveCampaigns = state.offers.filter(isLive).length;

  return (
    <div className="rounded-lg border bg-white p-5 text-foreground">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">NIL dollars raised this season</p>
          <p className="font-heading text-4xl font-extrabold text-primary">
            ${raised.toLocaleString("en-US")}
            <span className="text-lg text-muted-foreground"> of ${GOAL.toLocaleString("en-US")}</span>
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
      <p className="mt-2 text-xs text-muted-foreground">
        Counts paid sponsor deals, the athletes&apos; share of fan payments and gift sales. Goal comes from the
        Base revenue model. Demo counter: it starts from sample deals and grows with each payment
        in this browser.
      </p>
    </div>
  );
}
