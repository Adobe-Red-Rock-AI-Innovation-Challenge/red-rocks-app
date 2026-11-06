"use client";

import { useDemo } from "@/components/demo-provider";

const links = [
  { href: "#about", label: "About Red Rocks" },
  { href: "#athletes", label: "Meet the Athletes" },
  { href: "#partners", label: "Brand Partnerships", sponsorOnly: true },
  { href: "#fan-club", label: "Fan Club" },
];

export function HeroLinks() {
  const { state } = useDemo();

  return (
    <nav aria-label="Home sections" className="flex flex-wrap gap-2">
      {links
        .filter((link) => !link.sponsorOnly || state.role === "sponsor")
        .map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full border border-white/70 px-3 py-1 text-xs hover:bg-white/15"
          >
            {link.label}
          </a>
        ))}
    </nav>
  );
}
