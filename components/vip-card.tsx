"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { plans } from "@/lib/checkout";
import type { DemoUser, Membership } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VipCard({ user, membership }: { user: DemoUser; membership: Membership }) {
  const [flipped, setFlipped] = useState(false);
  const face =
    "absolute inset-0 flex flex-col justify-between rounded-xl p-5 [backface-visibility:hidden]";

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      aria-label={flipped ? "Show front of VIP Pass" : "Show QR code on VIP Pass"}
      className="block aspect-[1.6] w-full max-w-sm text-left [perspective:1000px]"
    >
      <span
        className={cn(
          "relative block size-full transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        <span className={cn(face, "bg-gradient-to-br from-neutral-950 to-primary text-white")}>
          <span className="font-heading text-xl font-extrabold tracking-wide uppercase">
            Red Rocks VIP
          </span>
          <span>
            <span className="block truncate font-heading text-3xl font-extrabold uppercase">
              {user.name}
            </span>
            <span className="text-sm text-neutral-200">
              {plans[membership].name} member · tap to flip
            </span>
          </span>
        </span>
        <span
          className={cn(
            face,
            "items-center justify-center gap-2 border bg-white [transform:rotateY(180deg)]",
          )}
        >
          <QRCodeSVG
            value={`RED-ROCKS-VIP:${membership}:${user.email}`}
            size={132}
            fgColor="#141414"
            title="VIP Pass QR code"
          />
          <span className="text-xs text-muted-foreground">Show this at the door</span>
        </span>
      </span>
    </button>
  );
}
