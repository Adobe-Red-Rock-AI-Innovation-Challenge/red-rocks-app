"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { useCheckout } from "@/components/checkout";
import { useDemo } from "@/components/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import type { AiSource as Source } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import type { Athlete, Quest } from "@/lib/types";

export function AthleteDetail({ athlete, quest }: { athlete: Athlete; quest: Quest | null }) {
  const { state } = useDemo();
  const [message, setMessage] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const { pay, busy, dialog } = useCheckout(() => {
    setMessage("");
    setSource(null);
  });

  const profile = state.athleteProfiles[athlete.id];
  const tags = profile?.tags ?? [...athlete.vibeTags, ...athlete.interestTags];
  const raised = quest ? quest.raised + (state.questContributions[quest.id] ?? 0) : 0;
  const percent = quest ? Math.min(100, Math.round((raised / quest.goal) * 100)) : 0;
  const stats = [
    { label: "Instagram", value: athlete.followers.instagram.toLocaleString("en-US") },
    { label: "TikTok", value: athlete.followers.tiktok.toLocaleString("en-US") },
    { label: "Engagement", value: `${athlete.engagementRate}%` },
  ];

  async function polish() {
    setPolishing(true);
    try {
      const { data, source: from } = await askAi("polish", {
        text: message,
        athleteName: athlete.name,
      });
      setMessage(data.text);
      setSource(from);
    } catch {
      toast.error("Could not polish your message. Please try again.");
    } finally {
      setPolishing(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-[20rem_1fr]">
      <div>
        <Image
          src={athlete.image}
          alt=""
          width={400}
          height={400}
          unoptimized
          className="aspect-square w-full rounded-lg object-cover"
        />
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border p-2">
              <dd className="font-heading text-xl font-extrabold text-primary">{stat.value}</dd>
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="min-w-0">
        <h1 className="text-5xl">{athlete.name}</h1>
        <p className="text-muted-foreground">
          {athlete.event} · {athlete.year} · {athlete.hometown}
        </p>
        <p className="mt-4">{profile?.bio ?? athlete.story}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {quest && (
          <section className="mt-8 rounded-lg border p-5">
            <h2 className="text-2xl">{quest.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{quest.description}</p>
            <div
              role="progressbar"
              aria-label="Quest progress"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-200"
            >
              <div
                className="h-full bg-primary transition-[width] duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-semibold">
              ${raised.toLocaleString("en-US")} of ${quest.goal.toLocaleString("en-US")}
              {raised >= quest.goal && " · Unlocked!"}
            </p>

            <Field label={`Send ${athlete.name} a note (optional)`} className="mt-5">
              <Textarea
                value={message}
                maxLength={500}
                onChange={(event) => setMessage(event.target.value)}
              />
            </Field>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                disabled={!message.trim() || polishing}
                onClick={polish}
              >
                ✨ {polishing ? "Polishing..." : "Polish with AI"}
              </Button>
              {source && <AiSource source={source} />}
            </div>

            <div className="mt-4 flex gap-2">
              {[5, 10].map((amount) => (
                <Button
                  key={amount}
                  size="lg"
                  className="flex-1"
                  disabled={busy}
                  onClick={() =>
                    pay({
                      kind: "quest",
                      questId: quest.id,
                      amount,
                      message: message.trim() || undefined,
                    })
                  }
                >
                  Support ${amount}
                </Button>
              ))}
            </div>
          </section>
        )}
      </div>
      {dialog}
    </div>
  );
}
