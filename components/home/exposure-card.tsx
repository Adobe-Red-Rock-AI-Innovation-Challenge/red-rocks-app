"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { playCrowd } from "@/lib/crowd-sound";

export function ExposureCard() {
  const [muted, setMuted] = useState(false);
  const [hint, setHint] = useState(false);

  async function cheer() {
    if (muted) return;
    setHint(!(await playCrowd()));
  }

  return (
    <div
      onMouseEnter={cheer}
      onClick={cheer}
      className="group relative flex min-h-60 flex-1 cursor-pointer flex-col justify-end overflow-hidden rounded-3xl p-6 text-white"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none"
        style={{ backgroundImage: "url(/images/home/exposure.webp)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#5a0000]/30 to-transparent" />
      <button
        type="button"
        aria-label={muted ? "Turn crowd sound on" : "Turn crowd sound off"}
        aria-pressed={!muted}
        onClick={(event) => {
          event.stopPropagation();
          setMuted(!muted);
        }}
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-black/40 backdrop-blur"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      <h3 className="relative text-2xl font-extrabold transition-transform duration-500 group-hover:scale-105">
        Massive Exposure
      </h3>
      <p className="relative mt-1 text-sm">
        12,207 fans per meet in 2025, and the nation&apos;s gymnastics attendance leader in 36 of the
        last 39 seasons.
      </p>
      {hint && <p className="relative mt-2 text-xs text-white/80">Click the card to hear the crowd.</p>}
    </div>
  );
}
