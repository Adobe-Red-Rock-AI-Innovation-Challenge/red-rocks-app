"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, LayoutGrid, Search } from "lucide-react";
import { athletes } from "@/lib/data";
import { cn } from "@/lib/utils";

function ArrowButton({
  label,
  enabled,
  onClick,
  children,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  // Black means there is more to see that way; red means the list ends there.
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border-2 border-white transition-colors",
        enabled ? "bg-black text-white hover:bg-neutral-800" : "bg-primary text-white",
      )}
    >
      {children}
    </button>
  );
}

export function AthleteCarousel() {
  const [query, setQuery] = useState("");
  const [grid, setGrid] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const track = useRef<HTMLDivElement>(null);
  const shown = athletes.filter((athlete) =>
    athlete.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const measure = useCallback(() => {
    const element = track.current;
    if (!element) return;
    setEdges({
      start: element.scrollLeft <= 2,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, query, grid]);

  function scroll(direction: 1 | -1) {
    const element = track.current;
    if (element) element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section id="athletes" className="scroll-mt-28 rounded-3xl bg-primary p-5 text-white sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl">Meet the Athletes</h2>
        <div className="flex items-center gap-2">
          <label className="flex h-9 items-center gap-2 rounded-full bg-white px-3 text-foreground">
            <span className="sr-only">Search athletes by name</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search here..."
              className="w-32 bg-transparent text-sm outline-none sm:w-44"
            />
            <Search className="size-4 text-muted-foreground" />
          </label>
          <button
            type="button"
            aria-pressed={grid}
            onClick={() => setGrid(!grid)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-sm"
          >
            {grid ? "Show as row" : "View All"}
            {grid ? <ArrowUpRight className="size-4" /> : <LayoutGrid className="size-4" />}
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-10">No athlete matches “{query}”.</p>
      ) : grid ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-white/10 p-3 sm:grid-cols-3 md:grid-cols-5">
          {shown.map((athlete) => (
            <li key={athlete.id}>
              <AthleteCard athlete={athlete} compact />
            </li>
          ))}
        </ul>
      ) : (
        <div
          ref={track}
          onScroll={measure}
          className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none]"
        >
          {shown.map((athlete) => (
            <div key={athlete.id} className="w-44 shrink-0 snap-start sm:w-52">
              <AthleteCard athlete={athlete} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {grid ? (
          <span />
        ) : (
          <div className="flex gap-2">
            <ArrowButton label="Previous athletes" enabled={!edges.start} onClick={() => scroll(-1)}>
              <ArrowLeft className="size-4" />
            </ArrowButton>
            <ArrowButton label="Next athletes" enabled={!edges.end} onClick={() => scroll(1)}>
              <ArrowRight className="size-4" />
            </ArrowButton>
          </div>
        )}
        <p className="max-w-sm text-right text-sm text-red-100">
          Meet the faces behind every victory: their journeys, career highlights and proudest
          achievements.
        </p>
      </div>
    </section>
  );
}

function AthleteCard({ athlete, compact = false }: { athlete: (typeof athletes)[number]; compact?: boolean }) {
  return (
    <Link
      href={`/athletes/${athlete.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-white text-foreground"
    >
      <Image
        src={athlete.image}
        alt={athlete.name}
        width={400}
        height={500}
        className={cn(
          "w-full object-cover object-top transition-transform duration-500 group-hover:scale-105",
          compact ? "aspect-square" : "aspect-[4/5]",
        )}
      />
      <Image
        src="/images/home/u-hands.png"
        alt=""
        width={32}
        height={32}
        className="absolute top-2 right-2 size-8 rounded-full bg-white/90 p-0.5"
      />
      <span className="block bg-neutral-800 px-2 py-2 text-center text-base text-white">
        {athlete.name}
      </span>
    </Link>
  );
}
