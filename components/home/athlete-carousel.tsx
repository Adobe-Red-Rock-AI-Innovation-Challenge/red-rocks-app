"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { athletes } from "@/lib/data";

export function AthleteCarousel() {
  const [query, setQuery] = useState("");
  const track = useRef<HTMLDivElement>(null);
  const shown = athletes.filter((athlete) =>
    `${athlete.name} ${athlete.event}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function scroll(direction: 1 | -1) {
    track.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  }

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

      <div ref={track} className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
        {shown.map((athlete) => (
          <Link
            key={athlete.id}
            href={`/athletes/${athlete.id}`}
            className="group relative w-44 shrink-0 snap-start overflow-hidden rounded-2xl bg-white sm:w-52"
          >
            <Image
              src={athlete.image}
              alt={athlete.name}
              width={400}
              height={480}
              unoptimized
              className="aspect-[5/6] w-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-neutral-800/90 py-2 text-center text-sm font-medium">
              {athlete.name}
            </span>
          </Link>
        ))}
        {shown.length === 0 && <p className="py-10 text-sm">No athlete matches “{query}”.</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous athletes"
            onClick={() => scroll(-1)}
            className="flex size-8 items-center justify-center rounded-full border border-white/60 hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next athletes"
            onClick={() => scroll(1)}
            className="flex size-8 items-center justify-center rounded-full bg-white text-primary"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
        <p className="max-w-sm text-right text-xs text-red-100">
          Meet the faces behind every victory: their journeys, career highlights and proudest
          achievements.
        </p>
      </div>
    </section>
  );
}
