"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AthletePicker } from "@/components/athlete-picker";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DealSteps } from "@/components/deal-steps";
import { athletes } from "@/lib/data";
import { needsNilGo, updateOffer } from "@/lib/deals";
import { checkOffer, worstStatus, type NilStatus } from "@/lib/nil";
import type { Athlete, Offer } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<NilStatus, { dot: string; label: string }> = {
  green: { dot: "bg-green-600", label: "Clear" },
  yellow: { dot: "bg-yellow-500", label: "Review" },
  red: { dot: "bg-red-700", label: "Blocked" },
};

// NIL Go has no public API, so the app prepares the facts the athlete types into the portal.
async function copyNilGoSummary(offer: Offer, athlete: Athlete) {
  const summary = [
    `Athlete: ${athlete.name}`,
    `Payer: ${offer.sponsorName}`,
    `Compensation: $${offer.price} (cash)`,
    `Deliverables: ${offer.deliverables}`,
    `Timeline: ${offer.timeline}`,
    `Business purpose: promotes ${offer.sponsorName}'s goods or services sold to the public`,
    `Disclosure: ${offer.caption}`,
  ].join("\n");
  try {
    await navigator.clipboard.writeText(summary);
    toast.success("Summary copied. Paste it into NIL Go.");
  } catch {
    toast.error("Could not copy the summary");
  }
}

function respond(offer: Offer, changes: Partial<Offer>, verb: string) {
  updateOffer(offer.id, changes, `${offer.title}: athlete ${verb}`, "/sponsor/deals");
}

function OfferCard({ offer, athlete, offers }: { offer: Offer; athlete: Athlete; offers: Offer[] }) {
  const [negotiating, setNegotiating] = useState(false);
  const [counter, setCounter] = useState(offer.price);
  const checks = checkOffer(offer, athlete);
  const overall = worstStatus(checks);
  const open = offer.status === "pending";
  const reportable = needsNilGo(offer, offers);

  return (
    <article className="rounded-lg border p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">{offer.sponsorName}</p>
          <h2 className="text-2xl">{offer.title}</h2>
        </div>
        <p className="font-heading text-3xl font-extrabold">
          ${offer.price.toLocaleString("en-US")}
        </p>
      </div>
      <p className="mt-2 text-sm">{offer.deliverables}</p>
      <p className="mt-1 text-sm text-muted-foreground">{offer.timeline}</p>
      <p className="mt-1 text-sm text-muted-foreground">Caption: {offer.caption}</p>
      <div className="mt-3">
        <DealSteps status={offer.status} />
      </div>

      <table className="mt-4 w-full text-sm">
        <caption className="mb-1 flex items-center gap-2 text-left font-semibold">
          NIL check: {statusStyles[overall].label}
        </caption>
        <tbody>
          {checks.map((check) => (
            <tr key={check.label} className="border-t">
              <td className="py-1.5 pr-3 whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", statusStyles[check.status].dot)} />
                  {statusStyles[check.status].label}
                </span>
              </td>
              <td className="py-1.5 pr-3 font-semibold">{check.label}</td>
              <td className="py-1.5 text-muted-foreground">{check.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {open ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            disabled={overall === "red"}
            onClick={() => {
              // Deals under the threshold need no clearance, so they skip straight past NIL Go.
              respond(offer, { status: reportable ? "accepted" : "cleared" }, "accepted");
              toast.success("Offer accepted");
            }}
          >
            Accept
          </Button>
          <Button variant="outline" onClick={() => setNegotiating(!negotiating)}>
            Negotiate
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              respond(offer, { status: "declined" }, "declined");
              toast("Offer declined");
            }}
          >
            Decline
          </Button>
          {negotiating && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                aria-label="Counter price in USD"
                className="w-28"
                value={Number.isNaN(counter) ? "" : counter}
                onChange={(event) => setCounter(event.target.valueAsNumber)}
              />
              <Button
                disabled={Number.isNaN(counter)}
                onClick={() => {
                  respond(offer, { status: "negotiating", counterPrice: counter }, "countered");
                  toast.success("Counteroffer sent");
                }}
              >
                Send counter
              </Button>
            </div>
          )}
          {overall === "red" && (
            <p className="w-full text-sm text-muted-foreground">
              Blocked offers cannot be accepted.
            </p>
          )}
        </div>
      ) : offer.status === "accepted" ? (
        <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-950">
          <p className="font-semibold">Report to NIL Go before you start</p>
          <p className="mt-1">
            Deals of $600 or more with one payer must be submitted to the College Sports
            Commission&apos;s NIL Go portal. Do not create content until it is cleared.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => copyNilGoSummary(offer, athlete)}>
              Copy deal summary for NIL Go
            </Button>
            <Button
              onClick={() => {
                respond(offer, { status: "cleared" }, "got NIL Go clearance");
                toast.success("Marked as cleared");
              }}
            >
              I got clearance
            </Button>
          </div>
        </div>
      ) : offer.status === "cleared" ? (
        <Button
          className="mt-4"
          onClick={() => {
            respond(offer, { status: "delivered" }, "posted the content");
            toast.success("Sponsor notified to pay");
          }}
        >
          Mark content delivered
        </Button>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {offer.status === "negotiating" &&
            `You countered at $${offer.counterPrice?.toLocaleString("en-US")}. Waiting for the sponsor.`}
          {offer.status === "delivered" && "Waiting for the sponsor to pay."}
          {offer.status === "paid" && "Paid. Thank you!"}
          {offer.status === "reported" && `Complete. ${offer.redemptions} fans redeemed the offer.`}
          {offer.status === "declined" && "Declined."}
        </p>
      )}
    </article>
  );
}

export default function AthleteDashboardPage() {
  const { state } = useDemo();
  const athlete = athletes.find((item) => item.id === state.activeAthleteId) ?? athletes[0];
  const offers = state.offers.filter((offer) => offer.athleteId === athlete.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-5xl">My deals</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Every offer gets an automatic NIL check. This is a screening aid, not legal advice.
      </p>
      <AthletePicker />
      <div className="mt-6 grid gap-4">
        {offers.length === 0 && (
          <p className="text-sm text-muted-foreground">No offers yet for {athlete.name}.</p>
        )}
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} athlete={athlete} offers={state.offers} />
        ))}
      </div>
    </div>
  );
}
