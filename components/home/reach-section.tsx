"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { athletes } from "@/lib/data";
import { sponsorPackages } from "@/lib/packages";
import { cn } from "@/lib/utils";

const MAX_PRICE = Math.max(...sponsorPackages.map((item) => item.price));

function athleteCount(id: string) {
  if (id === "spotlight") return 1;
  return id === "meet-night" ? 4 : athletes.length;
}

export function ReachSection() {
  const [selected, setSelected] = useState(sponsorPackages[1]);
  const share = (selected.price / MAX_PRICE) * 100;

  return (
    <section id="partners" className="scroll-mt-28 grid gap-6 lg:grid-cols-[1.2fr_1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl sm:text-4xl">
          <span className="text-primary">Unmatched</span> Reach.
          <br />
          <span className="text-primary">Unrivaled</span> Loyalty.
        </h2>
        <div
          className="flex min-h-56 flex-1 flex-col justify-end rounded-3xl bg-cover bg-center p-6 text-white"
          style={{ backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(90,0,0,0.3) 60%, transparent), url(/images/home/exposure.webp)" }}
        >
          <h3 className="text-2xl">Massive Exposure</h3>
          <p className="mt-1 text-sm text-red-50">
            12,207 fans per meet in 2025, and the nation&apos;s gymnastics attendance leader in 36
            of the last 39 seasons.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="relative flex size-44 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(var(--primary) ${share}%, #f6d6d6 ${share}% 100%)` }}
        >
          <div className="flex size-28 flex-col items-center justify-center rounded-full bg-background">
            <span className="text-xl font-bold">${selected.price.toLocaleString("en-US")}</span>
            <span className="text-xs text-muted-foreground">{selected.name}</span>
          </div>
        </div>
        <div role="group" aria-label="Budget" className="flex flex-wrap justify-center gap-1">
          {sponsorPackages.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected.id === item.id}
              onClick={() => setSelected(item)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                selected.id === item.id ? "border-primary bg-primary text-white" : "bg-white",
              )}
            >
              ${item.price.toLocaleString("en-US")}
            </button>
          ))}
        </div>
        <dl className="grid w-full max-w-56 gap-2 text-sm">
          {[
            ["Athletes promoting you", `${athleteCount(selected.id)}`],
            ["Fan offer", "Tracked per redemption"],
            ["Launch", "After NIL Go clearance"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-medium">{label}</dt>
              <dd className="rounded-full bg-primary py-1 font-semibold text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-4">
        {[
          { title: "NIL & Influencer Deals", href: "/sponsor/athletes", photo: "/images/home/sponsor-board.webp" },
          { title: "Tracked Fan Offers", href: "/sponsor/packages", photo: "/images/home/fans.webp" },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="relative flex min-h-36 flex-col justify-end rounded-3xl bg-cover bg-center p-5 text-white"
            style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1)), url(${card.photo})` }}
          >
            <Plus className="absolute top-4 left-4 size-7 rounded-full bg-white/20 p-1.5" />
            <span className="text-xl font-semibold">{card.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
