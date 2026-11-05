"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AthletePicker } from "@/components/athlete-picker";
import { useDemo } from "@/components/demo-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clinicTotal } from "@/lib/athlete-campaigns";
import { athletes } from "@/lib/data";
import { notification, setDemoState } from "@/lib/demo-store";
import type { SponsorRequest } from "@/lib/types";

function RequestCard({ request, athleteId }: { request: SponsorRequest; athleteId: string }) {
  const [note, setNote] = useState("");
  const responded = request.responses.some((response) => response.athleteId === athleteId);

  function raiseHand() {
    setDemoState((current) => ({
      ...current,
      requests: current.requests.map((item) =>
        item.id === request.id
          ? {
              ...item,
              responses: [
                ...item.responses,
                {
                  athleteId,
                  note: note.trim() || "I'm available and interested!",
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : item,
      ),
      notifications: [
        notification(`An athlete is interested in "${request.title}"`, "/sponsor/requests"),
        ...current.notifications,
      ],
    }));
    toast.success("The sponsor can now see you're interested");
  }

  return (
    <article className="rounded-lg border p-5">
      <p className="text-sm font-semibold text-primary">{request.sponsorName}</p>
      <h2 className="text-2xl">{request.title}</h2>
      <p className="text-sm text-muted-foreground">
        {request.service} · {request.date} · ${request.budget.toLocaleString("en-US")}
      </p>
      <p className="mt-2 text-sm">{request.details}</p>
      {responded ? (
        <p className="mt-4 text-sm font-semibold text-green-700">You said you&apos;re interested.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            aria-label="Note to the sponsor"
            placeholder="When are you free? (optional)"
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-w-0 flex-1 basis-60"
          />
          <Button onClick={raiseHand}>I&apos;m available and interested</Button>
        </div>
      )}
    </article>
  );
}

export default function OpportunitiesPage() {
  const { state } = useDemo();
  const athlete = athletes.find((item) => item.id === state.activeAthleteId) ?? athletes[0];
  const open = state.requests.filter((request) => request.status === "open");
  const mine = state.athleteCampaigns.filter((campaign) => campaign.athleteId === athlete.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl sm:text-5xl">Opportunities</h1>
        <Link href="/athlete/campaigns/new" className={buttonVariants({ size: "lg", className: "px-4" })}>
          <Plus className="size-4" /> Create campaign
        </Link>
      </div>
      <p className="mt-2 mb-6 text-muted-foreground">
        Sponsors posted these. Raise your hand if you&apos;re free and interested, or create your own
        campaign.
      </p>
      <AthletePicker />

      <h2 className="mt-8 text-2xl">Your campaigns</h2>
      <div className="mt-3 grid gap-3">
        {mine.length === 0 && (
          <p className="text-sm text-muted-foreground">
            None yet. Create a youth clinic or a signed drop and set your own price.
          </p>
        )}
        {mine.map((campaign) => (
          <article key={campaign.id} className="rounded-lg border p-4">
            <p className="text-xs font-semibold text-primary">
              {campaign.kind === "clinic" ? "Youth clinic" : "Signed drop"}
              {campaign.sample && " · Sample"}
            </p>
            <h3 className="text-xl">{campaign.title}</h3>
            <p className="mt-1 text-sm">{campaign.pitch}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {campaign.clinic
                ? `${campaign.clinic.date} · ${campaign.clinic.seats} spots × $${campaign.clinic.pricePerSeat} = $${clinicTotal(campaign).toLocaleString("en-US")} · ${campaign.clinic.bookedBy ? `Booked by ${campaign.clinic.bookedBy}` : "Open for clubs and sponsors"}`
                : campaign.drop
                  ? `$${campaign.drop.price} each · ${campaign.drop.sold} of ${campaign.drop.quantity} sold · Live on Gifts`
                  : null}
            </p>
          </article>
        ))}
      </div>

      <h2 className="mt-8 text-2xl">From sponsors</h2>
      <div className="mt-3 grid gap-4">
        {open.length === 0 && <p className="text-sm text-muted-foreground">No open requests.</p>}
        {open.map((request) => (
          <RequestCard key={request.id} request={request} athleteId={athlete.id} />
        ))}
      </div>
    </div>
  );
}
