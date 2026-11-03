"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderKanban, MessagesSquare, Sparkles, UserRound } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { businessName } from "@/lib/business";
import { cn } from "@/lib/utils";

const projectStatuses = ["accepted", "cleared", "delivered", "paid", "reported"];

export function BusinessSidebar() {
  const pathname = usePathname();
  const { state } = useDemo();
  const name = businessName(state);
  const mine = state.offers.filter((offer) => offer.sponsorName === name);
  const waiting = mine.filter(
    (offer) =>
      (offer.status === "negotiating" && offer.counterPrice !== undefined) ||
      offer.messages?.at(-1)?.from === "athlete",
  ).length;
  const projects = mine.filter((offer) => projectStatuses.includes(offer.status)).length;

  const items = [
    { href: "/business/profile", label: "Profile", icon: UserRound },
    { href: "/business/requests", label: "Requests", icon: MessagesSquare, count: waiting },
    { href: "/business/projects", label: "Projects", icon: FolderKanban, count: projects },
    { href: "/business/ai-history", label: "AI Assistant", icon: Bot, count: state.aiChats.length },
  ];

  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <p className="truncate px-3 text-xs text-muted-foreground">Business Hub</p>
      <p className="truncate px-3 text-lg font-extrabold">{name}</p>
      <nav aria-label="Business" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5",
              pathname === item.href ? "bg-black text-white" : "hover:bg-neutral-100",
            )}
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {item.count ? (
              <span className={cn("rounded-full px-2 text-xs", pathname === item.href ? "bg-white text-black" : "bg-primary text-white")}>
                {item.count}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <Link
        href="/business/assistant"
        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-white"
      >
        <Sparkles className="size-4" /> Open AI Assistant
      </Link>
    </aside>
  );
}
