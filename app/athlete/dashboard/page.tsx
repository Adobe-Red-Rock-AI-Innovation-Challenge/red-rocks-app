"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AthletePicker } from "@/components/athlete-picker";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { athletes } from "@/lib/data";
import { notification, setDemoState } from "@/lib/demo-store";
import { checkOffer, worstStatus, type NilStatus } from "@/lib/nil";
import type { Athlete, Offer, OfferStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<NilStatus, { dot: string; label: string }> = {
  green: { dot: "bg-green-600", label: "Clear" },
  yellow: { dot: "bg-yellow-500", label: "Review" },
  red: { dot: "bg-red-700", label: "Blocked" },
};

function respond(offer: Offer, status: OfferStatus, counterPrice?: number) {
  const verbs = { accepted: "accepted", negotiating: "countered", declined: "declined" };
  setDemoState((current) => ({
    ...current,
    offers: current.offers.map((item) =>
      item.id === offer.id ? { ...item, status, counterPrice } : item,
    ),
    notifications: [
      notification(
        `Your offer "${offer.title}" was ${verbs[status as keyof typeof verbs]}`,
        "/sponsor",
      ),
      ...current.notifications,
    ],
  }));
}

function OfferCard({ offer, athlete }: { offer: Offer; athlete: Athlete }) {
  const [negotiating, setNegotiating] = useState(false);
  const [counter, setCounter] = useState(offer.price);
  const checks = checkOffer(offer, athlete);
  const overall = worstStatus(checks);
  const open = offer.status === "pending";

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
              respond(offer, "accepted");
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
              respond(offer, "declined");
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
                  respond(offer, "negotiating", counter);
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
      ) : (
        <p className="mt-4 text-sm font-semibold capitalize">
          {offer.status}
          {offer.counterPrice !== undefined &&
            `: countered at $${offer.counterPrice.toLocaleString("en-US")}`}
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
      <h1 className="text-5xl">Offer inbox</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Every offer gets an automatic NIL check. This is a screening aid, not legal advice.
      </p>
      <AthletePicker />
      <div className="mt-6 grid gap-4">
        {offers.length === 0 && (
          <p className="text-sm text-muted-foreground">No offers yet for {athlete.name}.</p>
        )}
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} athlete={athlete} />
        ))}
      </div>
    </div>
  );
}
