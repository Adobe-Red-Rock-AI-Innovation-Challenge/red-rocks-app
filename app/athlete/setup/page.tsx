"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { AthletePicker } from "@/components/athlete-picker";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { AiOutput, AiSource as Source } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import { athletes } from "@/lib/data";
import { setDemoState } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

const questions = [
  "What moment shaped you most as a gymnast?",
  "What drives you to keep going?",
  "What do you care about outside the gym?",
];
const tones = ["Warmer", "Bolder", "Professional"];

export default function ProfileSetupPage() {
  const { state } = useDemo();
  const athlete = athletes.find((item) => item.id === state.activeAthleteId) ?? athletes[0];
  const [answers, setAnswers] = useState(questions.map(() => ""));
  const [result, setResult] = useState<AiOutput<"bio"> | null>(null);
  const [baseBios, setBaseBios] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [source, setSource] = useState<Source | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setBusy("bio");
    try {
      const { data, source: from } = await askAi("bio", { name: athlete.name, answers });
      setResult(data);
      setBaseBios(data.bios);
      setSelected(0);
      setSource(from);
    } catch {
      toast.error("Could not write your bio. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function changeTone(tone: string) {
    if (!result) return;
    setBusy(tone);
    try {
      // Tone always starts from the original draft so repeated clicks do not stack up.
      const { data, source: from } = await askAi("tone", { bio: baseBios[selected], tone });
      updateBio(data.text);
      setSource(from);
    } catch {
      toast.error("Could not change the tone. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function updateBio(text: string) {
    setResult(
      (current) =>
        current && {
          ...current,
          bios: current.bios.map((bio, index) => (index === selected ? text : bio)),
        },
    );
  }

  function save() {
    if (!result) return;
    setDemoState((current) => ({
      ...current,
      athleteProfiles: {
        ...current.athleteProfiles,
        [athlete.id]: {
          bio: result.bios[selected],
          tags: result.tags,
          rateCard: result.rateCard,
        },
      },
    }));
    toast.success("Profile saved to your athlete page");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Profile co-pilot</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Answer three questions. AI drafts your bio, tags and rate card.
      </p>
      <AthletePicker />

      <form onSubmit={generate} className="mt-6 grid gap-4">
        {questions.map((question, index) => (
          <Field key={question} label={question}>
            <Textarea
              required
              maxLength={600}
              className="min-h-16"
              value={answers[index]}
              onChange={(event) =>
                setAnswers(answers.map((item, i) => (i === index ? event.target.value : item)))
              }
            />
          </Field>
        ))}
        <Button type="submit" size="lg" disabled={busy !== null}>
          {busy === "bio" ? "Writing..." : "Generate my profile"}
        </Button>
      </form>

      {result && (
        <div className="mt-8 grid gap-6">
          {source && <AiSource source={source} />}
          <section>
            <h2 className="text-2xl">Choose a bio</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {result.bios.map((bio, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                  className={cn(
                    "rounded-lg border p-4 text-left text-sm",
                    selected === index && "border-primary ring-1 ring-primary",
                  )}
                >
                  {bio}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tones.map((tone) => (
                <Button
                  key={tone}
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => changeTone(tone)}
                >
                  {busy === tone ? "Rewriting..." : tone}
                </Button>
              ))}
            </div>
            <Field label="Edit selected bio" className="mt-3">
              <Textarea
                value={result.bios[selected]}
                onChange={(event) => updateBio(event.target.value)}
              />
            </Field>
          </section>

          <section>
            <h2 className="text-2xl">Suggested tags</h2>
            <Input
              aria-label="Tags, separated by commas"
              className="mt-3"
              value={result.tags.join(", ")}
              onChange={(event) =>
                setResult({ ...result, tags: event.target.value.split(/,\s*/) })
              }
            />
          </section>

          <section>
            <h2 className="text-2xl">Suggested rate card</h2>
            <div className="mt-3 grid gap-2">
              {result.rateCard.map((item, index) => (
                <div key={item.deliverable} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 text-sm">{item.deliverable}</span>
                  <Input
                    type="number"
                    min={0}
                    aria-label={`${item.deliverable} price in USD`}
                    className="w-28"
                    value={Number.isNaN(item.price) ? "" : item.price}
                    onChange={(event) =>
                      setResult({
                        ...result,
                        rateCard: result.rateCard.map((row, i) =>
                          i === index ? { ...row, price: event.target.valueAsNumber } : row,
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          <Button size="lg" onClick={save}>
            Save profile
          </Button>
        </div>
      )}
    </div>
  );
}
