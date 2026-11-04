"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowUp, Lightbulb, Sparkles, Users, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { AthleteSuggestion } from "@/components/business/athlete-suggestion";
import { FileCard } from "@/components/business/file-card";
import { useDemo } from "@/components/demo-provider";
import type { AssistantMode } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import { saveChat } from "@/lib/business";
import type { AiChat, AiChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const noSubscription = () => () => {};

const starters: { mode: AssistantMode; icon: typeof Users; title: string; text: string; prompt: string }[] = [
  {
    mode: "athlete",
    icon: Users,
    title: "Start with an athlete",
    text: "Find the right athlete, or learn about one.",
    prompt: "Which Red Rocks athletes would be a good fit for a local business like mine? Tell me about them.",
  },
  {
    mode: "campaign",
    icon: Lightbulb,
    title: "Start with a campaign idea",
    text: "Describe your idea and get athletes who fit it.",
    prompt: "We want to promote a new post-workout smoothie to students and families. Which athletes fit this campaign?",
  },
  {
    mode: "budget",
    icon: Wallet,
    title: "Start with a budget",
    text: "Share your budget for athletes, a campaign type, big idea and key message.",
    prompt: "We have $5,000 for this season. Which athletes fit, and what campaign would work well?",
  },
];

// One-tap follow-ups keep a live demo moving without typing.
const followUps = [
  "How do you measure results?",
  "What is NIL Go?",
  "What packages do you offer?",
  "How does it work?",
  "How many fans come to meets?",
];

function turn(role: AiChatMessage["role"], text: string, extra: Partial<AiChatMessage> = {}): AiChatMessage {
  return { id: crypto.randomUUID(), role, text, ...extra };
}

export default function AssistantPage() {
  const router = useRouter();
  const { state } = useDemo();
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => "");
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

  async function send(text: string, mode: AssistantMode) {
    const clean = text.trim();
    if (!clean || busy) return;
    const base: AiChat = current ?? {
      id: crypto.randomUUID(),
      mode,
      title: clean.slice(0, 60),
      createdAt: new Date().toISOString(),
      messages: [],
    };
    const asked = { ...base, messages: [...base.messages, turn("user", clean)] };
    setChat(asked);
    saveChat(asked);
    setDraft("");
    setBusy(true);
    try {
      const { data, source } = await askAi("assistant", {
        mode: asked.mode,
        messages: asked.messages.map((item) => ({ role: item.role, text: item.text })),
      });
      const answered = {
        ...asked,
        messages: [
          ...asked.messages,
          turn("assistant", data.reply, {
            athleteIds: data.athleteIds,
            files: data.files.map((file) => ({ ...file, id: crypto.randomUUID() })),
            source,
          }),
        ],
      };
      setChat(answered);
      saveChat(answered);
    } catch {
      toast.error("The assistant couldn't answer. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send(draft, current?.mode ?? "free");
  }

  const lastAsk = current?.messages.filter((item) => item.role === "user").at(-1)?.text ?? "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary">
            <Image src="/images/home/u-hands.png" alt="" width={28} height={28} className="size-7" />
          </span>
          <span className="font-extrabold">Red Rocks Business Assistant</span>
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
                    onClick={() => send(starter.prompt, starter.mode)}
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
                    {message.athleteIds && message.athleteIds.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {message.athleteIds.map((id) => (
                          <AthleteSuggestion key={id} athleteId={id} context={lastAsk} />
                        ))}
                      </div>
                    )}
                    {message.files?.map((file) => <FileCard key={file.id} file={file} />)}
                    {message.source && <AiSource source={message.source} />}
                  </li>
                ),
              )}
              {!busy && current.messages.at(-1)?.role === "assistant" && (
                <li aria-label="Suggested questions" className="flex flex-wrap gap-2">
                  {followUps
                    .filter((question) => !current.messages.some((message) => message.text === question))
                    .slice(0, 3)
                    .map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => send(question, current.mode)}
                        className="rounded-full border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                      >
                        {question}
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
                send(draft, current?.mode ?? "free");
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
