"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { businessName, requestRate } from "@/lib/business";
import { athletes } from "@/lib/data";

export function AthleteSuggestion({ athleteId, context }: { athleteId: string; context: string }) {
  const { state } = useDemo();
  const athlete = athletes.find((item) => item.id === athleteId);
  if (!athlete) return null;
  const sponsorName = businessName(state);
  const requested = state.offers.some(
    (offer) => offer.athleteId === athleteId && offer.sponsorName === sponsorName && offer.status === "inquiry",
  );
  const pending = state.user?.status === "pending";

  return (
    <div className="flex w-56 shrink-0 flex-col overflow-hidden rounded-2xl border bg-white">
      <Image
        src={athlete.image}
        alt={athlete.name}
        width={300}
        height={200}
        className="aspect-[3/2] w-full object-cover object-top"
      />
      <div className="flex flex-1 flex-col p-3">
        <p className="font-extrabold">{athlete.name}</p>
        <p className="text-sm text-muted-foreground">
          {athlete.event} · {athlete.year}
        </p>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            disabled={requested || pending}
            onClick={() => {
              requestRate(sponsorName, athleteId, context);
              toast.success(`Rate request sent to ${athlete.name}. Follow it in Requests.`);
            }}
            className="rounded-full bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-60"
          >
            {requested ? "Rate requested" : "Request rate"}
          </button>
          <Link href={`/athletes/${athlete.id}`} target="_blank" className="text-center text-sm underline">
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
