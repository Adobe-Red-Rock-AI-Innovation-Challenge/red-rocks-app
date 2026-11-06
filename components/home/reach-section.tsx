"use client";

import { useDemo } from "@/components/demo-provider";
import { FadeIn } from "@/components/fade-in";
import { BudgetDial } from "@/components/home/budget-dial";
import { ExpandCards } from "@/components/home/expand-cards";
import { ExposureCard } from "@/components/home/exposure-card";

// Brand Partnerships is a pitch to businesses, so only the sponsor role sees it on the home page.
export function ReachSection() {
  const { state } = useDemo();
  if (state.role !== "sponsor") return null;

  return (
    <section id="partners" className="grid scroll-mt-28 gap-6 lg:grid-cols-[1.2fr_1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl">
            <span className="text-primary">Unmatched</span> Reach.
            <br />
            <span className="text-primary">Unrivaled</span> Loyalty.
          </h2>
        </FadeIn>
        <ExposureCard />
      </div>
      <BudgetDial />
      <ExpandCards />
    </section>
  );
}
