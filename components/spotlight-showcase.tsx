"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShowcaseItem = {
  id: string;
  image: string;
  alt: string;
  title: string;
  subtitle: string;
  details?: { label: string; value: string }[];
  actions?: { href: string; label: string }[];
};

const beam =
  "pointer-events-none absolute left-1/2 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,238,215,0.6),rgba(255,238,215,0.12)_45%,transparent_72%)]";

// A dark gallery shelf: hovering lights one piece and dims the rest; opening one zooms it
// under a spotlight with its details beside it, like a product showroom.
export function SpotlightShowcase({ items, label }: { items: ShowcaseItem[]; label: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const item = items[shown];

  function step(direction: 1 | -1) {
    setShown((current) => (current + direction + items.length) % items.length);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#07080b,#12141b_55%,#07080b)] px-4 pt-10 pb-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
      <ul
        aria-label={label}
        className="group/stage flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none]"
      >
        {items.map((entry, index) => (
          <li key={entry.id} className="snap-start">
            <button
              type="button"
              onClick={() => {
                setShown(index);
                setOpenIndex(index);
              }}
              className="group/niche relative flex w-40 shrink-0 flex-col items-center text-left outline-none sm:w-48"
            >
              <span className="mb-2 size-1.5 rounded-full bg-amber-100/70 shadow-[0_0_12px_4px_rgba(255,236,200,0.5)]" />
              <span
                className={cn(
                  beam,
                  "top-2 h-72 w-56 opacity-25 transition-opacity duration-500 group-hover/niche:opacity-100 group-focus-visible/niche:opacity-100",
                )}
              />
              <span className="relative block w-full overflow-hidden rounded-t-lg brightness-75 transition duration-500 group-hover/stage:brightness-[0.35] group-hover/niche:!scale-[1.04] group-hover/niche:!brightness-110 group-focus-visible/niche:!brightness-110 motion-reduce:transition-none">
                <Image
                  src={entry.image}
                  alt={entry.alt}
                  unoptimized={entry.image.endsWith(".svg")}
                  width={400}
                  height={520}
                  className="aspect-[4/5] w-full object-cover"
                />
              </span>
              <span className="relative block w-[108%] rounded-sm bg-[linear-gradient(180deg,#2a2d36,#15171d)] py-2 text-center shadow-[0_8px_18px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                <span className="block truncate px-2 text-sm font-semibold text-white">{entry.title}</span>
                <span className="block truncate px-2 text-[11px] text-neutral-400">{entry.subtitle}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm transition-opacity duration-500 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 outline-none transition-[opacity,transform] duration-500 data-[ending-style]:scale-75 data-[ending-style]:opacity-0 data-[starting-style]:scale-75 data-[starting-style]:opacity-0 motion-reduce:transition-none"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") step(1);
              if (event.key === "ArrowLeft") step(-1);
            }}
          >
            {item && (
              <div className="relative grid w-full max-w-4xl items-center gap-6 md:grid-cols-[1.1fr_1fr]">
                <div className="relative flex justify-center pt-10">
                  <span className={cn(beam, "-top-4 h-[120%] w-[130%] opacity-100")} />
                  <div key={item.id} className="relative animate-in duration-500 zoom-in-90 fade-in motion-reduce:animate-none">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      unoptimized={item.image.endsWith(".svg")}
                      width={900}
                      height={1100}
                      className="max-h-[60vh] w-auto rounded-lg object-contain shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
                    />
                    <div className="mx-auto mt-0 h-6 w-[110%] -translate-x-[4.5%] rounded-sm bg-[linear-gradient(180deg,#2a2d36,#111318)]" />
                  </div>
                </div>

                <div
                  key={`info-${item.id}`}
                  className="animate-in rounded-2xl bg-white p-6 text-foreground duration-500 slide-in-from-right-6 fade-in motion-reduce:animate-none"
                >
                  <Dialog.Title className="text-3xl">{item.title}</Dialog.Title>
                  <Dialog.Description className="mt-1 text-muted-foreground">{item.subtitle}</Dialog.Description>
                  {item.details && (
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      {item.details.map((detail) => (
                        <div key={detail.label}>
                          <dt className="text-muted-foreground">{detail.label}</dt>
                          <dd className="font-semibold">{detail.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {item.actions && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.actions.map((action, index) => (
                        <Link
                          key={action.href}
                          href={action.href}
                          onClick={() => setOpenIndex(null)}
                          className={cn(
                            "rounded-full px-4 py-2 text-sm font-semibold",
                            index === 0 ? "bg-primary text-white" : "bg-neutral-100",
                          )}
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {shown + 1} / {items.length}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Previous"
                        onClick={() => step(-1)}
                        className="flex size-9 items-center justify-center rounded-full border hover:bg-neutral-100"
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next"
                        onClick={() => step(1)}
                        className="flex size-9 items-center justify-center rounded-full bg-primary text-white"
                      >
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <Dialog.Close
                  aria-label="Close"
                  className="absolute -top-2 right-0 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <X className="size-5" />
                </Dialog.Close>
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
