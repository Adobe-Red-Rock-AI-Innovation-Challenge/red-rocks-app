"use client";

import { useRef, useState, type PointerEvent } from "react";

// Planning estimates: impressions assume a blended cost of roughly $15 to $25 per thousand
// across athlete social, team channels, VIP Pass offers and in-arena placements.
const levels = [
  { label: "$1,000", reach: "40K", channels: "1 channel", launch: "21 Days" },
  { label: "$2,000", reach: "90K", channels: "2 channels", launch: "21 Days" },
  { label: "$3,000", reach: "140K", channels: "2 channels", launch: "14 Days" },
  { label: "$5,000", reach: "250K", channels: "3 channels", launch: "14 Days" },
  { label: "$10K", reach: "550K", channels: "3 channels", launch: "10 Days" },
  { label: "$20K", reach: "1.2M", channels: "4 channels", launch: "10 Days" },
  { label: "$50K", reach: "3M", channels: "5 channels", launch: "7 Days" },
  { label: "$100K", reach: "6.5M", channels: "6 channels", launch: "7 Days" },
  { label: "$200K", reach: "13M", channels: "7 channels", launch: "5 Days" },
  { label: "$500K", reach: "30M", channels: "8 channels", launch: "3 Days" },
  { label: "Unlimited", reach: "Custom", channels: "Every channel", launch: "Priority" },
];

const SIZE = 184;
const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BudgetDial() {
  const [index, setIndex] = useState(3);
  const dragging = useRef(false);
  const level = levels[index];
  const fraction = index / (levels.length - 1);
  const angle = fraction * 2 * Math.PI;
  const knob = {
    x: SIZE / 2 + RADIUS * Math.sin(angle),
    y: SIZE / 2 - RADIUS * Math.cos(angle),
  };

  function pick(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    const turned = (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI);
    const next = Math.round((turned / (2 * Math.PI)) * (levels.length - 1));
    // Ignore jumps across the top so dragging past either end doesn't wrap around.
    setIndex((current) => (Math.abs(next - current) > levels.length / 2 ? current : next));
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="slider"
        tabIndex={0}
        aria-label="Estimated budget"
        aria-valuemin={0}
        aria-valuemax={levels.length - 1}
        aria-valuenow={index}
        aria-valuetext={level.label}
        className="cursor-grab touch-none rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          pick(event);
        }}
        onPointerMove={(event) => dragging.current && pick(event)}
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
          Est. Budget
        </text>
        <circle cx={knob.x} cy={knob.y} r={11} fill="#000" stroke="#fff" strokeWidth={3} />
      </svg>

      <dl className="grid w-full max-w-60 gap-2 text-sm">
        {[
          ["Delivering up to", `${level.reach} impressions`],
          ["Across", level.channels],
          ["With priority launch in", level.launch],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className="rounded-full bg-primary py-1 font-extrabold text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="max-w-60 text-xs text-muted-foreground">
        All figures are estimates. For more, <a href="#join" className="underline">contact our team</a>.
      </p>
    </div>
  );
}
