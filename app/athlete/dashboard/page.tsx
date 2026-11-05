"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AthletePicker } from "@/components/athlete-picker";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DealSteps } from "@/components/deal-steps";
import { NilCheckTable } from "@/components/nil-check-table";
import { athletes } from "@/lib/data";
import { needsNilGo, sendDealMessage, updateOffer } from "@/lib/deals";
import { checkOffer, worstStatus } from "@/lib/nil";
import type { Athlete, Offer } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  updateOffer(offer.id, changes, `${offer.title}: athlete ${verb}`, "/business/requests");
}

// Businesses ask for a rate instead of guessing one; the athlete sets the price here.
function QuoteForm({ offer }: { offer: Offer }) {
  const [quote, setQuote] = useState(500);
  const [note, setNote] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        updateOffer(
          offer.id,
          { status: "negotiating", counterPrice: quote },
          `${offer.title}: athlete quoted $${quote}`,
          `/business/requests?request=${offer.id}`,
        );
        if (note.trim()) sendDealMessage(offer, "athlete", note);
        toast.success("Quote sent");
      }}
      className="mt-4 grid gap-2 rounded-lg bg-neutral-50 p-4"
    >
      <p className="text-sm font-semibold">{offer.sponsorName} asked for your rate.</p>
      <div className="flex flex-wrap gap-2">
        <Input
          type="number"
          min={50}
          required
          aria-label="Your quote in USD"
          className="w-32"
          value={Number.isNaN(quote) ? "" : quote}
          onChange={(event) => setQuote(event.target.valueAsNumber)}
        />
        <Input
          aria-label="Note to the business"
          className="min-w-0 flex-1 basis-48"
          maxLength={500}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What this includes and when you're free"
        />
        <Button type="submit" disabled={Number.isNaN(quote)}>
          Send quote
        </Button>
      </div>
    </form>
  );
}

function DealThread({ offer }: { offer: Offer }) {
  const [reply, setReply] = useState("");
  const messages = offer.messages ?? [];
  if (messages.length === 0) return null;

  return (
    <div className="mt-4 grid gap-2">
      <p className="text-sm font-semibold">Messages with {offer.sponsorName}</p>
      {messages.map((message) => (
        <p
          key={message.id}
          className={cn(
            "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
            message.from === "athlete" ? "justify-self-end bg-primary text-white" : "justify-self-start bg-neutral-100",
          )}
        >
          {message.text}
        </p>
      ))}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!reply.trim()) return;
          sendDealMessage(offer, "athlete", reply);
          setReply("");
        }}
        className="flex gap-2"
      >
        <Input
          aria-label={`Reply to ${offer.sponsorName}`}
          value={reply}
          maxLength={1000}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Reply"
        />
        <Button type="submit" variant="outline" disabled={!reply.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
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
          {offer.status === "inquiry" ? "Your quote" : `$${offer.price.toLocaleString("en-US")}`}
        </p>
      </div>
      <p className="mt-2 text-sm">{offer.deliverables}</p>
      <p className="mt-1 text-sm text-muted-foreground">{offer.timeline}</p>
      <p className="mt-1 text-sm text-muted-foreground">Caption: {offer.caption}</p>
      <div className="mt-3">
        <DealSteps status={offer.status} />
      </div>

      <NilCheckTable checks={checks} className="mt-4" />

      <DealThread offer={offer} />

      {offer.status === "inquiry" ? (
        <QuoteForm offer={offer} />
      ) : open ? (
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
  const sales = state.sales.filter((sale) => sale.athleteId === athlete.id);
  const dealPay = offers
    .filter((offer) => offer.status === "paid" || offer.status === "reported")
    .reduce((sum, offer) => sum + offer.price, 0);
  const giftPay = sales.reduce((sum, sale) => sum + sale.athleteShare, 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">My deals</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Every offer gets an automatic NIL check. This is a screening aid, not legal advice.
      </p>
      <AthletePicker />
      <section aria-label="Payouts" className="mt-6 grid gap-3 rounded-2xl bg-neutral-950 p-5 text-white sm:grid-cols-3">
        {[
          ["Paid deals", dealPay],
          [`Gift sales (${sales.length})`, giftPay],
          ["Total payouts", dealPay + giftPay],
        ].map(([label, value]) => (
          <div key={label as string}>
            <p className="text-sm text-neutral-300">{label}</p>
            <p className="text-2xl font-bold">${(value as number).toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
          </div>
        ))}
        <p className="text-xs text-neutral-400 sm:col-span-3">
          Paid to your bank through Stripe Connect. Simulated in this demo.
        </p>
      </section>
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
