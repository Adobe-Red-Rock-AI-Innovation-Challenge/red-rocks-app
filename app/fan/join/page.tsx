"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { useCheckout } from "@/components/checkout";
import { FanSeasonGoal } from "@/components/season-goal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { MAX_SUPPORT, MIN_SUPPORT, plans } from "@/lib/checkout";
import type { Membership } from "@/lib/types";

export default function JoinPage() {
  const [paid, setPaid] = useState(false);
  const [gift, setGift] = useState(25);
  const { pay, busy, dialog } = useCheckout(() => setPaid(true));
  const validGift = Number.isInteger(gift) && gift >= MIN_SUPPORT && gift <= MAX_SUPPORT;

  if (paid) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl">You&apos;re in!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for supporting Red Rocks.</p>
        <Link
          href="/fan/dashboard"
          className={buttonVariants({ size: "lg", className: "mt-6 px-4" })}
        >
          Go to My Pass
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Join the community</h1>
      <p className="mt-2 text-muted-foreground">Pick a plan or give once. Cancel anytime.</p>
      <FanSeasonGoal className="mt-6" />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(plans) as [Membership, (typeof plans)[Membership]][]).map(([id, plan]) => (
          <section key={id} className="flex flex-col rounded-lg border p-5">
            <h2 className="text-2xl">{plan.name}</h2>
            <p className="mt-1 font-heading text-4xl font-extrabold text-primary">
              ${plan.price}
              <span className="text-base font-semibold text-muted-foreground">/month</span>
            </p>
            <ul className="mt-4 grid flex-1 gap-2 text-sm">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  {perk}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="mt-5"
              disabled={busy}
              onClick={() => pay({ kind: "membership", plan: id })}
            >
              Choose {plan.name}
            </Button>
          </section>
        ))}

        <section className="flex flex-col rounded-lg border p-5">
          <h2 className="text-2xl">Season supporter</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay once, no membership. Includes a digital thank-you card from the team.
          </p>
          <div className="mt-4 flex gap-2">
            {[10, 25, 50].map((amount) => (
              <Button
                key={amount}
                variant={gift === amount ? "default" : "outline"}
                className="flex-1"
                onClick={() => setGift(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>
          <Field label="Other amount" className="mt-3 flex-1 content-start">
            <Input
              type="number"
              min={MIN_SUPPORT}
              max={MAX_SUPPORT}
              value={Number.isNaN(gift) ? "" : gift}
              onChange={(event) => setGift(event.target.valueAsNumber)}
            />
          </Field>
          <Button
            size="lg"
            className="mt-5"
            disabled={busy || !validGift}
            onClick={() => pay({ kind: "gift", amount: gift })}
          >
            Give{validGift ? ` $${gift}` : ""}
          </Button>
        </section>
      </div>
      {dialog}
    </div>
  );
}
