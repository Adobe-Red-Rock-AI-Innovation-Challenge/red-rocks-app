"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Gift, Package, Video } from "lucide-react";
import { useCheckout } from "@/components/checkout";
import { useDemo } from "@/components/demo-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { athletes, quests } from "@/lib/data";
import { ATHLETE_SHARE_PERCENT, giftProducts, SCHOOL_GIVING_URL } from "@/lib/gifts";
import { cn } from "@/lib/utils";

const productIcons = { "shout-out": Video, "signed-card": Package, "meet-greet": Gift };

export default function GiftsPage() {
  const { state } = useDemo();
  const { pay, busy, dialog } = useCheckout();
  const [athleteId, setAthleteId] = useState(athletes[0].id);
  const athlete = athletes.find((item) => item.id === athleteId) ?? athletes[0];

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-14 px-4 py-12">
      <header>
        <h1 className="text-4xl sm:text-5xl">Gifts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Back the gymnasts you love. Quests and gifts pay athletes directly; Crimson Club gifts
          support the whole department.
        </p>
      </header>

      <section>
        <h2 className="text-2xl sm:text-3xl">Quests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fund an athlete project together. When it hits the goal, everyone gets what they made.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {quests.map((quest) => {
            const owner = athletes.find((item) => item.id === quest.athleteId);
            const raised = quest.raised + (state.questContributions[quest.id] ?? 0);
            const percent = Math.min(100, Math.round((raised / quest.goal) * 100));
            return (
              <article key={quest.id} className="flex flex-col rounded-2xl border p-5">
                <p className="text-xs font-semibold text-primary">{owner?.name}</p>
                <h3 className="text-xl">{quest.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{quest.description}</p>
                <div
                  role="progressbar"
                  aria-label={`${quest.title} progress`}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-200"
                >
                  <div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1 text-sm font-semibold">
                  ${raised.toLocaleString("en-US")} of ${quest.goal.toLocaleString("en-US")}
                  {raised >= quest.goal && " · Unlocked!"}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[5, 10].map((amount) => (
                    <Button
                      key={amount}
                      disabled={busy}
                      onClick={() => pay({ kind: "quest", questId: quest.id, amount })}
                    >
                      Support ${amount}
                    </Button>
                  ))}
                </div>
                <Link
                  href={`/athletes/${quest.athleteId}`}
                  className="mt-2 text-center text-xs text-muted-foreground underline"
                >
                  Add a note with ✨ Polish with AI
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl">Gifts from an athlete</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an athlete, then a gift. {ATHLETE_SHARE_PERCENT}% of every sale goes to the athlete.
        </p>
        <div role="radiogroup" aria-label="Athlete" className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {athletes.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={athleteId === item.id}
              onClick={() => setAthleteId(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border py-1 pr-4 pl-1 text-sm font-semibold",
                athleteId === item.id ? "border-primary bg-primary text-white" : "bg-white",
              )}
            >
              <Image src={item.image} alt="" width={32} height={32} unoptimized className="size-8 rounded-full object-cover" />
              {item.name}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {giftProducts.map((product) => {
            const Icon = productIcons[product.id as keyof typeof productIcons] ?? Gift;
            return (
              <article key={product.id} className="flex flex-col rounded-2xl border p-5">
                <Icon className="size-8 rounded-full bg-red-50 p-1.5 text-primary" />
                <h3 className="mt-3 text-xl">{product.name}</h3>
                <p className="text-sm text-muted-foreground">from {athlete.name}</p>
                <p className="mt-2 flex-1 text-sm">{product.description}</p>
                <p className="mt-3 text-2xl font-bold text-primary">${product.price}</p>
                <p className="text-xs text-muted-foreground">
                  {athlete.name.split(" ")[0]} gets ${((product.price * ATHLETE_SHARE_PERCENT) / 100).toFixed(2)}
                </p>
                <Button
                  className="mt-3"
                  disabled={busy}
                  onClick={() => pay({ kind: "product", productId: product.id, athleteId: athlete.id })}
                >
                  Buy
                </Button>
              </article>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Payouts to athletes run through Stripe Connect, which pays each athlete&apos;s own
          account and handles their tax forms. In this demo the payout is simulated. Gifts of
          $600 or more from one buyer may need NIL Go reporting.
        </p>
      </section>

      <section className="grid items-center gap-6 rounded-3xl bg-neutral-950 p-6 text-white sm:p-8 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl sm:text-3xl">Give to the program</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            The Utah Crimson Club is Utah Athletics&apos; official way to give. Gifts there fund
            scholarships and teams across the department and are tax-deductible, but they do not
            go to one athlete&apos;s NIL. This hub is not part of the Crimson Club.
          </p>
        </div>
        <a
          href={SCHOOL_GIVING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg", className: "px-5" })}
        >
          Visit the Crimson Club <ExternalLink />
        </a>
      </section>
      {dialog}
    </div>
  );
}
