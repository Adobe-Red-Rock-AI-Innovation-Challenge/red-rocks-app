"use client";

import Link from "next/link";
import { useCheckout } from "@/components/checkout";
import { DealSteps } from "@/components/deal-steps";
import { useDemo } from "@/components/demo-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { athletes } from "@/lib/data";
import { updateOffer } from "@/lib/deals";
import type { Offer } from "@/lib/types";

function nextAction(offer: Offer) {
  switch (offer.status) {
    case "pending":
      return "Waiting for the athlete to respond.";
    case "accepted":
      return "Accepted. The athlete is getting NIL Go clearance.";
    case "cleared":
      return "Cleared. The athlete is creating the content.";
    case "paid":
      return "Paid. Results are tracking.";
    case "reported":
      return "Complete. See Results.";
    default:
      return null;
  }
}

export default function SponsorDealsPage() {
  const { state } = useDemo();
  const { pay, busy, dialog } = useCheckout();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Deals</h1>
      <p className="mt-2 text-muted-foreground">Every offer, from first message to results.</p>

      <div className="mt-6 grid gap-4">
        {state.offers.map((offer) => {
          const athlete = athletes.find((item) => item.id === offer.athleteId);
          return (
            <article key={offer.id} className="rounded-lg border p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    {offer.sponsorName} → {athlete?.name}
                    {offer.sample && " · Sample"}
                  </p>
                  <h2 className="text-2xl">{offer.title}</h2>
                </div>
                <p className="font-heading text-3xl font-extrabold">
                  ${offer.price.toLocaleString("en-US")}
                </p>
              </div>
              <div className="mt-3">
                <DealSteps status={offer.status} />
              </div>

              {offer.status === "negotiating" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <p className="w-full text-sm">
                    {athlete?.name} countered at{" "}
                    <strong>${offer.counterPrice?.toLocaleString("en-US")}</strong>.
                  </p>
                  <Button
                    onClick={() =>
                      updateOffer(
                        offer.id,
                        { status: "accepted", price: offer.counterPrice ?? offer.price },
                        `${offer.sponsorName} accepted your counteroffer`,
                        "/athlete/dashboard",
                      )
                    }
                  >
                    Accept counter
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      updateOffer(
                        offer.id,
                        { status: "declined" },
                        `${offer.sponsorName} declined your counteroffer`,
                        "/athlete/dashboard",
                      )
                    }
                  >
                    Decline
                  </Button>
                </div>
              )}

              {offer.status === "delivered" && (
                <div className="mt-4">
                  <p className="text-sm">Content is live. Pay the athlete to complete the deal.</p>
                  <Button
                    className="mt-2"
                    disabled={busy}
                    onClick={() =>
                      pay({
                        kind: "deal",
                        offerId: offer.id,
                        title: offer.title,
                        amount: offer.price,
                      })
                    }
                  >
                    Pay ${offer.price.toLocaleString("en-US")}
                  </Button>
                </div>
              )}

              {offer.status === "paid" && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() =>
                    updateOffer(
                      offer.id,
                      { status: "reported" },
                      `Results published for "${offer.title}"`,
                      "/sponsor/results",
                    )
                  }
                >
                  Close campaign and publish results
                </Button>
              )}

              {nextAction(offer) && (
                <p className="mt-3 text-sm text-muted-foreground">{nextAction(offer)}</p>
              )}
            </article>
          );
        })}
      </div>

      <Link
        href="/sponsor/results"
        className={buttonVariants({ size: "lg", className: "mt-6 px-4" })}
      >
        See results
      </Link>
      {dialog}
    </div>
  );
}
