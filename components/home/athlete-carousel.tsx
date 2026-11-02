"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { SpotlightShowcase } from "@/components/spotlight-showcase";
import { athletes } from "@/lib/data";

function compact(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

export function AthleteCarousel() {
  const [query, setQuery] = useState("");
  const shown = athletes.filter((athlete) =>
    `${athlete.name} ${athlete.event}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section id="athletes" className="scroll-mt-28 rounded-3xl bg-primary p-5 text-white sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl">Meet the Athletes</h2>
        <div className="flex items-center gap-2">
          <label className="flex h-9 items-center gap-2 rounded-full bg-white px-3 text-sm text-foreground">
            <span className="sr-only">Search athletes</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search here..."
              className="w-32 bg-transparent outline-none sm:w-40"
            />
            <Search className="size-4 text-muted-foreground" />
          </label>
          <Link
            href="/athletes"
            className="flex h-9 items-center gap-1 rounded-full bg-neutral-950 px-4 text-sm font-semibold"
          >
            View All <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {shown.length === 0 ? (
          <p className="py-10 text-sm">No athlete matches “{query}”.</p>
        ) : (
          <SpotlightShowcase
            label="Athletes"
            items={shown.map((athlete) => ({
              id: athlete.id,
              image: athlete.image,
              alt: athlete.name,
              title: athlete.name,
              subtitle: `${athlete.event} · ${athlete.year}`,
              details: [
                { label: "Hometown", value: athlete.hometown },
                { label: "Engagement", value: `${athlete.engagementRate}%` },
                { label: "Instagram", value: compact(athlete.followers.instagram) },
                { label: "TikTok", value: compact(athlete.followers.tiktok) },
              ],
              actions: [
                { href: `/athletes/${athlete.id}`, label: "View profile" },
                { href: "/gifts", label: "Support" },
              ],
            }))}
          />
        )}
      </div>

      <p className="mt-4 text-right text-xs text-red-100">
        Hover to light up an athlete. Click to step into the spotlight.
      </p>
    </section>
  );
}
