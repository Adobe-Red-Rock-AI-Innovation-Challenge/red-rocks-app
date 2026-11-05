"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowRight, ArrowUp, Lightbulb, Sparkles, Users, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { AthleteSuggestion } from "@/components/business/athlete-suggestion";
import { FileCard } from "@/components/business/file-card";
import { useDemo } from "@/components/demo-provider";
import type { AssistantMode } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import { saveChat } from "@/lib/business";
import {
  athletesWithTags,
  findAthlete,
  openerChips,
  openers,
  PERSONALITY_TAGS,
  pickScenario,
  PROPOSAL_NOTE,
  scenarios,
  undecided,
} from "@/lib/demo-script";
import type { AiChat, AiChatMessage, Athlete } from "@/lib/types";
import { cn } from "@/lib/utils";

const noSubscription = () => () => {};

const starters: { mode: Exclude<AssistantMode, "free">; icon: typeof Users; title: string; text: string }[] = [
  { mode: "athlete", icon: Users, title: "Start with an athlete", text: "Find the right athlete, or learn about one." },
  { mode: "campaign", icon: Lightbulb, title: "Start with a campaign idea", text: "Describe your idea and get athletes who fit it." },
  { mode: "budget", icon: Wallet, title: "Start with a budget", text: "Share your budget for athletes, a campaign type, big idea and key message." },
];

// One-tap follow-ups keep a live demo moving without typing.
const followUps = ["How do you measure results?", "What is NIL Go?", "What packages do you offer?", "How does it work?"];

type Reply = Omit<AiChatMessage, "id" | "role">;

function turn(role: AiChatMessage["role"], text: string, extra: Partial<AiChatMessage> = {}): AiChatMessage {
  return { id: crypto.randomUUID(), role, text, ...extra };
}

function profileSummary(athlete: Athlete) {
  const highs = athlete.highlights.slice(0, 2).join(" · ");
  return `${athlete.name}: ${athlete.year} from ${athlete.hometown}${athlete.event !== "Red Rocks gymnast" ? `, ${athlete.event}` : ""}.${highs ? ` ${highs}.` : ""} Personal brand: ${athlete.personalityTags.join(" ")}.`;
}

// Scripted demo turns run locally, so the conversation follows the team's script exactly.
function scriptedReply(chat: AiChat, text: string): { reply: Reply; script: AiChat["script"] } | null {
  const step = chat.script?.step ?? 0;

  // A longer request ("write a campaign with Avery for my brand") goes to the AI instead of the script.
  if (chat.mode === "athlete" && text.split(/\s+/).length <= 6) {
    const named = findAthlete(text);
    if (named.length > 0) {
      return {
        reply: {
          text: `${named.map(profileSummary).join("\n\n")}\n\nOpen the profile for the full story, or use Request rate to ask for a quote.`,
          athleteIds: named.map((athlete) => athlete.id),
          link: { href: `/athletes/${named[0].id}`, label: `Open ${named[0].name}'s profile` },
        },
        script: { id: "athlete", step: 0 },
      };
    }
    if (undecided(text)) {
      return {
        reply: {
          text: "Happy to help you choose. What personality fits your brand? Pick one or more of the personal-brand hashtags athletes use:",
          chips: PERSONALITY_TAGS,
        },
        script: { id: "athlete", step: 1 },
      };
    }
    const { tags, matches } = athletesWithTags(text);
    if (matches.length > 0) {
      return {
        reply: {
          text: `Athletes with ${tags.join(" or ")} on their profile:\n${matches.map((athlete) => `• ${athlete.name} (${athlete.personalityTags.join(" ")})`).join("\n")}\n\nThese hashtags are sample personal-brand tags for the demo; athletes set their own.`,
          athleteIds: matches.slice(0, 4).map((athlete) => athlete.id),
        },
        script: { id: "athlete", step: 1 },
      };
    }
    return null;
  }

  if (chat.mode === "campaign" || chat.mode === "budget") {
    const scenario = chat.script ? scenarios[chat.script.id] : pickScenario(chat.mode, text);
    if (!scenario || step < 0) return null;
    if (step < scenario.replies.length) {
      return {
        reply: { text: scenario.replies[step], chips: [scenario.businessLines[step + 1]] },
        script: { id: scenario.id, step: step + 1 },
      };
    }
    return {
      reply: {
        text: `${scenario.final}\n\n${PROPOSAL_NOTE}`,
        athleteIds: scenario.athleteIds,
        files: [{ id: crypto.randomUUID(), name: scenario.file, content: "", url: `/proposals/${scenario.file}` }],
      },
      script: { id: scenario.id, step: -1 },
    };
  }
  return null;
}

export default function AssistantPage() {
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => "");
  // A new search string (from Open AI Assistant) mounts a fresh conversation.
  return <Assistant key={search} search={search} />;
}

function Assistant({ search }: { search: string }) {
  const router = useRouter();
  const { state } = useDemo();
  const resumeId = new URLSearchParams(search).get("chat");
  const [chat, setChat] = useState<AiChat | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const resumed = resumeId ? state.aiChats.find((item) => item.id === resumeId) ?? null : null;
  const current = chat ?? resumed;

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [current?.messages.length, busy]);

  function commit(next: AiChat) {
    setChat(next);
    saveChat(next);
  }

  function start(mode: Exclude<AssistantMode, "free">, title: string) {
    commit({
      id: crypto.randomUUID(),
      mode,
      title,
      createdAt: new Date().toISOString(),
      messages: [turn("user", title), turn("assistant", openers[mode], { chips: openerChips[mode], source: "script" })],
    });
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const base: AiChat = current ?? {
      id: crypto.randomUUID(),
      mode: "free",
      title: clean.slice(0, 60),
      createdAt: new Date().toISOString(),
      messages: [],
    };
    const asked = { ...base, messages: [...base.messages, turn("user", clean)] };
    commit(asked);
    setDraft("");
    setBusy(true);
    try {
      const scripted = scriptedReply(asked, clean);
      if (scripted) {
        // A short pause reads as the assistant thinking.
        await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 900));
        commit({
          ...asked,
          script: scripted.script,
          messages: [...asked.messages, turn("assistant", scripted.reply.text, { ...scripted.reply, source: "script" })],
        });
        return;
      }
      const { data, source } = await askAi("assistant", {
        mode: asked.mode,
        messages: asked.messages.map((item) => ({ role: item.role, text: item.text })),
      });
      commit({
        ...asked,
        messages: [
          ...asked.messages,
          turn("assistant", data.reply, {
            athleteIds: data.athleteIds,
            files: data.files.map((file) => ({ ...file, id: crypto.randomUUID() })),
            source,
          }),
        ],
      });
    } catch {
      toast.error("The assistant couldn't answer. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function requested(athleteName: string, requestId: string) {
    if (!current) return;
    const first = athleteName.split(" ")[0];
    commit({
      ...current,
      messages: [
        ...current.messages,
        turn(
          "assistant",
          `Request sent to ${athleteName}. We'll notify you as soon as ${first} replies with a quote. You can follow it in Business Hub → Requests; right now its status is “Waiting for the athlete's quote.”`,
          { link: { href: `/business/requests?request=${requestId}`, label: `View the request with ${first}` }, source: "script" },
        ),
      ],
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send(draft);
  }

  const lastAsk = current?.messages.filter((item) => item.role === "user").at(-1)?.text ?? "";
  const last = current?.messages.at(-1);
  const chips =
    last?.role === "assistant"
      ? last.chips ?? followUps.filter((question) => !current?.messages.some((message) => message.text === question)).slice(0, 3)
      : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary">
            <Image src="/images/home/u-hands.png" alt="" width={28} height={28} className="size-7" />
          </span>
          <span className="font-extrabold">AI Assistant — quick ideas</span>
        </div>
        <button
          type="button"
          aria-label="Close the assistant and go to your dashboard"
          onClick={() => router.push("/business/projects")}
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          {!current || current.messages.length === 0 ? (
            <div className="pt-6 text-center">
              <Sparkles className="mx-auto size-10 text-primary" />
              <h1 className="mt-3 text-3xl sm:text-4xl">How can I help your business?</h1>
              <p className="mt-2 text-muted-foreground">Pick a starting point or ask anything.</p>
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                {starters.map((starter) => (
                  <button
                    key={starter.mode}
                    type="button"
                    onClick={() => start(starter.mode, starter.title)}
                    className="group rounded-2xl border p-4 transition hover:border-primary hover:shadow-md"
                  >
                    <starter.icon className="size-6 text-primary" />
                    <p className="mt-3 font-extrabold">{starter.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{starter.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="grid gap-6">
              {current.messages.map((message) =>
                message.role === "user" ? (
                  <li key={message.id} className="max-w-[85%] justify-self-end rounded-2xl bg-black px-4 py-3 whitespace-pre-wrap text-white">
                    {message.text}
                  </li>
                ) : (
                  <li key={message.id} className="grid gap-3">
                    <div className="whitespace-pre-wrap">{message.text}</div>
                    {message.link && (
                      <Link
                        href={message.link.href}
                        className="inline-flex items-center gap-1.5 justify-self-start rounded-full bg-black px-4 py-2 text-sm text-white"
                      >
                        {message.link.label} <ArrowRight className="size-4" />
                      </Link>
                    )}
                    {message.athleteIds && message.athleteIds.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {message.athleteIds.map((id) => (
                          <AthleteSuggestion key={id} athleteId={id} context={lastAsk} onRequested={requested} />
                        ))}
                      </div>
                    )}
                    {message.files?.map((file) => <FileCard key={file.id} file={file} />)}
                    {message.source && <AiSource source={message.source} />}
                  </li>
                ),
              )}
              {!busy && chips.length > 0 && (
                <li aria-label="Suggested replies" className="flex flex-wrap justify-end gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => send(chip)}
                      className="max-w-full rounded-2xl border px-3 py-1.5 text-left text-sm hover:border-primary hover:text-primary"
                    >
                      <span className="line-clamp-2">{chip}</span>
                    </button>
                  ))}
                </li>
              )}
              {busy && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="size-4 animate-pulse text-primary" /> Thinking...
                </li>
              )}
            </ol>
          )}
          <div ref={bottom} />
        </div>
      </div>

      <form onSubmit={submit} className="border-t px-4 py-3">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-3xl border px-4 py-2 focus-within:border-primary">
          <textarea
            aria-label="Message the assistant"
            rows={1}
            maxLength={2000}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
            placeholder="Ask about athletes, a campaign idea or your budget..."
            className="max-h-40 flex-1 resize-none bg-transparent py-1.5 outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={busy || !draft.trim()}
            className={cn("flex size-9 items-center justify-center rounded-full bg-primary text-white", (busy || !draft.trim()) && "opacity-40")}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
          The assistant never quotes athlete rates; ask athletes directly with Request rate. AI can make mistakes.
        </p>
      </form>
    </div>
  );
}
