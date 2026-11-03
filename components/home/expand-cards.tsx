"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { Plus, X } from "lucide-react";

type Card = {
  title: string;
  photo: string;
  intro: string;
  sections: { heading: string; items: { label: string; text: string }[] }[];
  cta: { href: string; label: string };
  note: string;
};

const cards: Card[] = [
  {
    title: "NIL & Influencer Deals",
    photo: "/images/home/sponsor-board.webp",
    intro: "Partner with the gymnasts fans already cheer for every week, and see exactly what it brings in.",
    sections: [
      {
        heading: "Typical campaign results (planning estimates)",
        items: [
          { label: "2–4%", text: "of VIP Pass members who see an offer redeem it" },
          { label: "$10–$20", text: "per in-store visit, tracked by a personal code" },
          { label: "1–3 weeks", text: "from signing to launch, after NIL Go clearance" },
        ],
      },
      {
        heading: "Why businesses choose it",
        items: [
          { label: "Trust", text: "Fans follow these athletes all season, so the message lands as a recommendation." },
          { label: "Proof", text: "Every redemption is counted, so you pay for visits, not guesses." },
          { label: "Whole team", text: "Team packages share your budget across the roster." },
          { label: "Compliant", text: "#ad disclosure and NIL Go paperwork are built in." },
        ],
      },
    ],
    cta: { href: "/sponsor/planner", label: "Plan a campaign" },
    note: "Estimates, not guarantees. Results depend on the offer and the athletes.",
  },
  {
    title: "In-Arena Branding",
    photo: "/images/home/fans.webp",
    intro: "Be part of the meet-night show at the Jon M. Huntsman Center, where about 12,000 fans fill the seats.",
    sections: [
      {
        heading: "Placements",
        items: [
          { label: "Center video board", text: "Logo or video spots between rotations, seen by every seat." },
          { label: "LED ribbon boards", text: "Rotating messages along the seating bowl during the meet." },
          { label: "Mat-side signage", text: "Banners and table skirts in camera view next to the floor." },
          { label: "Concourse booth", text: "Sample, sell or sign up fans face to face before the meet." },
          { label: "Fan giveaways", text: "Your name on glow sticks, posters or T-shirt tosses." },
          { label: "PA announcements", text: "A short sponsored read during breaks." },
        ],
      },
    ],
    cta: { href: "#join", label: "Ask about placements" },
    note: "In-arena inventory is sold by Utah Athletics. We connect you with their partnership team.",
  },
];

export function ExpandCards() {
  return (
    <div className="grid gap-4">
      {cards.map((card) => (
        <Dialog.Root key={card.title}>
          <Dialog.Trigger
            className="group relative flex min-h-36 flex-col justify-end overflow-hidden rounded-3xl bg-cover bg-center p-5 text-left text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1)), url(${card.photo})` }}
          >
            <span className="absolute top-4 left-4 flex size-8 items-center justify-center rounded-full bg-white/25 transition group-hover:scale-110 group-hover:bg-primary">
              <Plus className="size-4" />
            </span>
            <span className="text-xl font-extrabold">{card.title}</span>
            <span className="sr-only">Show details</span>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-xl transition-[opacity,scale] duration-300 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 motion-reduce:transition-none">
              <div
                className="relative flex min-h-40 flex-col justify-end bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2)), url(${card.photo})` }}
              >
                <Dialog.Title className="text-3xl font-extrabold">{card.title}</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-white/90">{card.intro}</Dialog.Description>
                <Dialog.Close
                  aria-label="Close"
                  className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-black/40"
                >
                  <X className="size-4" />
                </Dialog.Close>
              </div>
              <div className="grid gap-6 p-6">
                {card.sections.map((section) => (
                  <section key={section.heading}>
                    <h3 className="text-lg font-extrabold">{section.heading}</h3>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      {section.items.map((item) => (
                        <div key={item.label} className="rounded-2xl bg-neutral-50 p-3">
                          <dt className="font-extrabold text-primary">{item.label}</dt>
                          <dd className="text-sm">{item.text}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
                <p className="text-xs text-muted-foreground">{card.note}</p>
                <Dialog.Close
                  render={
                    <Link
                      href={card.cta.href}
                      className="justify-self-start rounded-full bg-primary px-5 py-2.5 text-sm text-white"
                    />
                  }
                >
                  {card.cta.label}
                </Dialog.Close>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </div>
  );
}
