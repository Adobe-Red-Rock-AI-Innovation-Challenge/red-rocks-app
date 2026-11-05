"use client";

import { useState, type FormEvent } from "react";
import { Radio } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { athletes } from "@/lib/data";
import { endLive, goLive, LIVE_PLATFORMS, liveLinkProblem } from "@/lib/live";
import type { LivePlatform } from "@/lib/types";

export function GoLivePanel({ athleteId }: { athleteId: string }) {
  const { state } = useDemo();
  const session = state.live.find((item) => item.athleteId === athleteId);
  const [platform, setPlatform] = useState<LivePlatform>("TikTok");
  const [url, setUrl] = useState("");

  function start(event: FormEvent) {
    event.preventDefault();
    const problem = liveLinkProblem(platform, url);
    if (problem) {
      toast.error(problem);
      return;
    }
    goLive(athleteId, platform, url);
    setUrl("");
    toast.success("You're live. Fans got a notification.");
  }

  return (
    <section aria-label="Go live" className="mt-6 rounded-2xl border p-4">
      <h2 className="flex items-center gap-2 text-lg">
        <Radio className="size-5 text-primary" /> Go live
      </h2>
      {session ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <LiveTag />
          <p className="text-sm">
            You&apos;re live on {session.platform}
            {session.sample && " (sample)"}. Fans see a LIVE badge that opens your stream.
          </p>
          <Button variant="outline" onClick={() => endLive(athleteId)}>
            End live
          </Button>
        </div>
      ) : (
        <form onSubmit={start} className="mt-3 grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
          <Field label="Platform">
            <Select value={platform} onChange={(event) => setPlatform(event.target.value as LivePlatform)}>
              {LIVE_PLATFORMS.map((item) => (
                <option key={item.platform}>{item.platform}</option>
              ))}
            </Select>
          </Field>
          <Field label="Live link">
            <Input
              type="url"
              value={url}
              placeholder={LIVE_PLATFORMS.find((item) => item.platform === platform)?.example}
              onChange={(event) => setUrl(event.target.value)}
            />
          </Field>
          <Button type="submit">Go live</Button>
        </form>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Go live on your own account first, then paste the link. The hub notifies fans and links out;
        it never shows the stream itself.
      </p>
    </section>
  );
}

export function LiveTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-extrabold text-white">
      <span className="size-1.5 animate-pulse rounded-full bg-white" /> LIVE
    </span>
  );
}

// Sits over an athlete card; the link opens the stream in a new tab.
export function LiveBadge({ athleteId }: { athleteId: string }) {
  const { state } = useDemo();
  const session = state.live.find((item) => item.athleteId === athleteId);
  if (!session) return null;
  const name = athletes.find((item) => item.id === athleteId)?.name;
  return (
    <a
      href={session.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} is live on ${session.platform}. Watch in a new tab`}
      className="absolute top-3 left-3 z-10"
    >
      <LiveTag />
    </a>
  );
}

export function LiveBanner() {
  const { state } = useDemo();
  if (state.live.length === 0) return null;
  return (
    <ul aria-label="Live now" className="mt-6 grid gap-2">
      {state.live.map((session) => {
        const name = athletes.find((item) => item.id === session.athleteId)?.name;
        return (
          <li key={session.athleteId}>
            <a
              href={session.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-black px-4 py-3 text-white hover:bg-neutral-800"
            >
              <LiveTag />
              <span className="font-semibold">
                {name} is live on {session.platform}
              </span>
              <span className="text-sm text-white/70">{session.sample ? "Sample · " : ""}Watch in a new tab ↗</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
