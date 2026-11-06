"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { sponsorPackages } from "@/lib/packages";

// The dial stops only at the three real packages, so its prices always match the Packages page.
const details: Record<string, { athletes: string; runs: string }> = {
  spotlight: { athletes: "1 athlete", runs: "One campaign" },
  "meet-night": { athletes: "4 athletes", runs: "One meet week" },
  anchor: { athletes: "Every athlete", runs: "The whole season" },
};

const levels = sponsorPackages.map((item) => ({
  label: `$${item.price.toLocaleString("en-US")}`,
  note: item.priceNote ?? "per campaign",
  name: item.name,
  ...details[item.id],
}));

const SIZE = 184;
const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BudgetDial() {
  const [index, setIndex] = useState(0);
  const dragging = useRef(false);
  const level = levels[index];
  // Thirds of the ring: Spotlight fills one, Meet Night two, Anchor the whole ring.
  const fraction = (index + 1) / levels.length;
  const angle = fraction * 2 * Math.PI;
  const knob = {
    x: SIZE / 2 + RADIUS * Math.sin(angle),
    y: SIZE / 2 - RADIUS * Math.cos(angle),
  };

  function pick(event: PointerEvent<SVGSVGElement>, dragged: boolean) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    const turned = (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI);
    const next = Math.min(levels.length - 1, Math.max(0, Math.round((turned / (2 * Math.PI)) * levels.length) - 1));
    // While dragging, ignore jumps across the top so dragging past either end doesn't wrap around.
    setIndex((current) => (dragged && Math.abs(next - current) > levels.length / 2 ? current : next));
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="slider"
        tabIndex={0}
        aria-label="Sponsor package"
        aria-valuemin={0}
        aria-valuemax={levels.length - 1}
        aria-valuenow={index}
        aria-valuetext={`${level.name}, ${level.label} ${level.note}`}
        className="cursor-grab touch-none rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          pick(event, false);
        }}
        onPointerMove={(event) => dragging.current && pick(event, true)}
        onPointerUp={() => (dragging.current = false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") setIndex((i) => Math.min(levels.length - 1, i + 1));
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") setIndex((i) => Math.max(0, i - 1));
        }}
      >
        <defs>
          <linearGradient id="dial-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c20202" />
            <stop offset="1" stopColor="#f3b3b3" />
          </linearGradient>
        </defs>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f7dede" strokeWidth={26} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="url(#dial-red)"
          strokeWidth={26}
          strokeDasharray={`${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          className="transition-[stroke-dasharray] duration-200"
        />
        <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-[20px] font-extrabold">
          {level.label}
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          {level.note}
        </text>
        <circle cx={knob.x} cy={knob.y} r={11} fill="#000" stroke="#fff" strokeWidth={3} />
      </svg>

      <dl className="grid w-full max-w-60 gap-2 text-sm">
        {[
          ["Package", level.name],
          ["With", level.athletes],
          ["Runs for", level.runs],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className="rounded-full bg-primary py-1 font-extrabold text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="max-w-60 text-xs text-muted-foreground">
        Prices are planning estimates.{" "}
        <Link href="/sponsor/packages" className="underline">
          See what each package includes
        </Link>
        .
      </p>
    </div>
  );
}
