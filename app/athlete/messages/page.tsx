"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { AthletePicker } from "@/components/athlete-picker";
import { ChatThread } from "@/components/chat-thread";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { AiSource as Source } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import { awaitingReply, messageProblem, sendAthleteReply, setBlocked } from "@/lib/chat";
import { athletes } from "@/lib/data";
import { cn } from "@/lib/utils";

function InnerCircleBadge() {
  return (
    <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-[11px] font-semibold text-white">
      Inner Circle
    </span>
  );
}

export default function AthleteMessagesPage() {
  const { state } = useDemo();
  const athlete = athletes.find((item) => item.id === state.activeAthleteId) ?? athletes[0];
  // Inner Circle members are answered first.
  const conversations = state.conversations
    .filter((item) => item.athleteId === athlete.id)
    .sort((a, b) => Number(b.tier === "inner") - Number(a.tier === "inner"));
  const [openId, setOpenId] = useState<string | null>(null);
  const open = conversations.find((item) => item.id === openId) ?? conversations[0];
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);

  async function suggest() {
    const last = open?.messages.filter((item) => item.from === "fan").at(-1);
    if (!open || !last) return;
    setBusy(true);
    try {
      const { data, source: from } = await askAi("reply", {
        athleteName: athlete.name,
        fanName: open.fanName,
        message: last.text,
      });
      setDraft(data.text);
      setSource(from);
    } catch {
      toast.error("Could not suggest a reply. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function send(event: FormEvent) {
    event.preventDefault();
    if (!open) return;
    const problem = messageProblem(draft);
    if (problem) {
      toast.error(problem);
      return;
    }
    sendAthleteReply(open.id, draft);
    setDraft("");
    setSource(null);
    toast.success("Reply sent");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Fan messages</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Members write to you here; Inner Circle members come first. AI only drafts, you always
        press send, and you can turn off any conversation.
      </p>
      <AthletePicker />

      {conversations.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No messages yet for {athlete.name}.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-[16rem_1fr]">
          <ul aria-label="Conversations" className="grid content-start gap-2">
            {conversations.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(item.id);
                    setDraft("");
                    setSource(null);
                  }}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left",
                    item.id === open?.id && "border-primary ring-1 ring-primary",
                  )}
                >
                  <span className="flex items-center justify-between gap-2 font-semibold">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{item.fanName}</span>
                      {item.tier === "inner" && <InnerCircleBadge />}
                    </span>
                    {awaitingReply(item) && <span className="size-2 rounded-full bg-primary" aria-label="Needs reply" />}
                  </span>
                  <span className="line-clamp-1 text-sm text-muted-foreground">
                    {item.blocked ? "Turned off" : item.messages.at(-1)?.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {open && (
            <section aria-label={`Conversation with ${open.fanName}`} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-xl">
                  {open.fanName}
                  {open.tier === "inner" && <InnerCircleBadge />}
                </h2>
                <Button variant="ghost" onClick={() => setBlocked(open.id, !open.blocked)}>
                  {open.blocked ? "Turn messages back on" : "Turn off messages"}
                </Button>
              </div>
              <div className="mt-3 max-h-80 overflow-y-auto">
                <ChatThread
                  messages={open.messages}
                  mine="athlete"
                  names={{ fan: open.fanName, athlete: "You" }}
                />
              </div>
              {!open.blocked && (
                <form onSubmit={send} className="mt-4 grid gap-2">
                  <Textarea
                    aria-label="Your reply"
                    className="min-h-16"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" disabled={busy} onClick={suggest}>
                      ✨ {busy ? "Writing..." : "Suggest a reply"}
                    </Button>
                    <Button type="submit">Send reply</Button>
                    {source && <AiSource source={source} />}
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
