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
import { AthleteChat } from "@/components/athlete-chat";
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
  // Only published numbers appear here: career highs come from the official roster bio.
  const stats = Object.entries(athlete.careerHighs).map(([label, value]) => ({ label, value }));

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
          alt={athlete.name}
          width={600}
          height={750}
          className="aspect-[4/5] w-full rounded-lg object-cover object-top"
        />
        {stats.length > 0 && (
          <>
            <p className="mt-4 text-xs font-semibold text-muted-foreground uppercase">Career highs</p>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border p-2">
                  <dd className="text-lg font-bold text-primary">{stat.value}</dd>
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </>
        )}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {athlete.instagram && (
            <a
              href={`https://www.instagram.com/${athlete.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline"
            >
              @{athlete.instagram}
            </a>
          )}
          <a href={athlete.bioUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Official bio
          </a>
        </div>
        <AthleteChat athlete={athlete} />
      </div>

      <div className="min-w-0">
        <h1 className="text-4xl sm:text-5xl">{athlete.name}</h1>
        <p className="text-muted-foreground">
          {athlete.event} · {athlete.year} · {athlete.hometown}
        </p>
        <p className="mt-4">{profile?.bio ?? athlete.story}</p>
        {athlete.highlights.length > 0 && (
          <section className="mt-5">
            <h2 className="text-lg">Accomplishments</h2>
            <ul className="mt-2 grid gap-1.5">
              {athlete.highlights.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
        {athlete.interests && (
          <p className="mt-4 text-sm">
            <span className="text-muted-foreground">Off the floor: </span>
            {athlete.interests.replace(/^Enjoys /, "Enjoys ")}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Source: official Utah Athletics roster bio.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...tags, ...(profile ? [] : athlete.personalityTags)].map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        {!profile && (
          <p className="mt-1 text-xs text-muted-foreground">
            Hashtags are sample personal-brand tags for the demo; athletes set their own in Profile.
          </p>
        )}

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
