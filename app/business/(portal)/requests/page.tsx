"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DealSteps } from "@/components/deal-steps";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { businessName } from "@/lib/business";
import { athletes } from "@/lib/data";
import { sendDealMessage, updateOffer } from "@/lib/deals";
import type { Offer } from "@/lib/types";
import { cn } from "@/lib/utils";

const openStatuses: Offer["status"][] = ["inquiry", "pending", "negotiating", "declined"];

function statusLine(offer: Offer) {
  if (offer.status === "inquiry") return "Waiting for the athlete's quote";
  if (offer.status === "negotiating" && offer.counterPrice !== undefined) {
    return `Athlete quoted $${offer.counterPrice.toLocaleString("en-US")}`;
  }
  if (offer.status === "pending") return `Offer of $${offer.price.toLocaleString("en-US")} sent`;
  return "Declined";
}

export default function RequestsPage() {
  const { state } = useDemo();
  const name = businessName(state);
  const requests = state.offers.filter((offer) => offer.sponsorName === name && openStatuses.includes(offer.status));
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const open = requests.find((offer) => offer.id === openId) ?? requests[0];
  const athlete = athletes.find((item) => item.id === open?.athleteId);

  function send(event: FormEvent) {
    event.preventDefault();
    if (!open || !draft.trim()) return;
    sendDealMessage(open, "sponsor", draft);
    setDraft("");
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">Requests</h1>
      <p className="mt-1 text-muted-foreground">Talk with athletes and agree on NIL deals before they become projects.</p>

      {requests.length === 0 ? (
        <div className="mt-6 rounded-2xl border p-6 text-center">
          <p className="text-muted-foreground">No requests yet. Ask the AI Assistant to find athletes, then use Request rate.</p>
          <Link href="/business/assistant" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-white">
            Open AI Assistant
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
          <ul aria-label="Requests" className="grid content-start gap-2">
            {requests.map((offer) => {
              const who = athletes.find((item) => item.id === offer.athleteId);
              const unread = offer.messages?.at(-1)?.from === "athlete";
              return (
                <li key={offer.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(offer.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                      offer.id === open?.id && "border-primary ring-1 ring-primary",
                    )}
                  >
                    {who && <Image src={who.image} alt="" width={40} height={40} className="size-10 rounded-full object-cover object-top" />}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate">{who?.name}</span>
                        {unread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="New reply" />}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{statusLine(offer)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {open && athlete && (
            <section aria-label={`Request with ${athlete.name}`} className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-xl">{athlete.name}</h2>
                  <p className="text-sm text-muted-foreground">{open.title}</p>
                </div>
                <p className="text-2xl font-extrabold">
                  {open.status === "inquiry" ? "Quote pending" : `$${(open.counterPrice ?? open.price).toLocaleString("en-US")}`}
                </p>
              </div>
              <div className="mt-3">
                <DealSteps status={open.status} />
              </div>
              <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm">{open.deliverables}</p>

              <ol className="mt-4 grid max-h-72 gap-2 overflow-y-auto">
                {(open.messages ?? []).map((message) => (
                  <li
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      message.from === "sponsor" ? "justify-self-end bg-black text-white" : "justify-self-start bg-neutral-100",
                    )}
                  >
                    {message.text}
                  </li>
                ))}
              </ol>

              {open.status !== "declined" && (
                <form onSubmit={send} className="mt-3 grid gap-2">
                  <Textarea
                    aria-label="Message the athlete"
                    className="min-h-16"
                    maxLength={1000}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ask about timing, deliverables or terms"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={!draft.trim()}>
                      Send message
                    </Button>
                    {open.status === "negotiating" && open.counterPrice !== undefined && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          updateOffer(
                            open.id,
                            { status: "accepted", price: open.counterPrice },
                            `${name} accepted your quote of $${open.counterPrice}`,
                            "/athlete/dashboard",
                          );
                          toast.success("Accepted. It's now a project.");
                        }}
                      >
                        Accept ${open.counterPrice?.toLocaleString("en-US")}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        updateOffer(open.id, { status: "declined" }, `${name} withdrew "${open.title}"`, "/athlete/dashboard");
                        toast("Request closed");
                      }}
                    >
                      {open.status === "negotiating" ? "Decline" : "Withdraw"}
                    </Button>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
