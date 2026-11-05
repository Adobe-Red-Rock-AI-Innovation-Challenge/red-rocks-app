"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ChatThread } from "@/components/chat-thread";
import { useDemo } from "@/components/demo-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { MAX_MESSAGE_LENGTH, messageProblem, sendFanMessage } from "@/lib/chat";
import { setDemoState } from "@/lib/demo-store";
import type { Athlete } from "@/lib/types";

// Messaging athletes is a member perk. Members need only a first name to write; nothing else is collected here.
export function AthleteChat({ athlete }: { athlete: Athlete }) {
  const { state } = useDemo();
  const { membership } = state;
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const fanName = state.fan?.name;
  const conversation = fanName
    ? state.conversations.find((item) => item.athleteId === athlete.id && item.fanName === fanName)
    : undefined;
  const first = athlete.name.split(" ")[0];

  function send(event: FormEvent) {
    event.preventDefault();
    if (!membership) return;
    const problem = messageProblem(text);
    if (problem) {
      toast.error(problem);
      return;
    }
    let sender = fanName;
    if (!sender) {
      sender = name.trim().slice(0, 40);
      if (!sender) {
        toast.error("Add your first name so the athlete knows who wrote.");
        return;
      }
      setDemoState((current) => ({ ...current, fan: { name: sender as string, email: "" } }));
    }
    sendFanMessage(athlete.id, sender, text, membership);
    setText("");
    toast.success(`Sent to ${first}`);
  }

  return (
    <section className="mt-6 rounded-2xl border p-4" aria-label={`Message ${athlete.name}`}>
      <h2 className="flex items-center gap-2 text-lg">
        <MessageCircle className="size-5 text-primary" />
        Message {first}
      </h2>
      {conversation?.blocked ? (
        <p className="mt-2 text-sm text-muted-foreground">Messages to {first} are turned off.</p>
      ) : (
        <>
          {conversation && (
            <div className="mt-3 max-h-64 overflow-y-auto">
              <ChatThread
                messages={conversation.messages}
                mine="fan"
                names={{ fan: "You", athlete: athlete.name }}
              />
            </div>
          )}
          {!membership ? (
            <div className="mt-3 rounded-xl bg-neutral-50 p-4 text-center">
              <Lock className="mx-auto size-5 text-primary" />
              <p className="mt-2 text-sm font-semibold">Members can message athletes — Join from $10/month</p>
              <Link href="/fan/join" className={buttonVariants({ className: "mt-3 px-4" })}>
                Join to message {first}
              </Link>
            </div>
          ) : (
            <form onSubmit={send} className="mt-3 grid gap-2">
              {!fanName && (
                <Input
                  aria-label="Your first name"
                  placeholder="Your first name"
                  value={name}
                  maxLength={40}
                  onChange={(event) => setName(event.target.value)}
                />
              )}
              <Textarea
                aria-label={`Message to ${first}`}
                className="min-h-16"
                placeholder={`Cheer ${first} on or ask a question`}
                value={text}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(event) => setText(event.target.value)}
              />
              <Button type="submit">Send</Button>
            </form>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Be kind. No links, handles or contact details. Red Rocks staff can see messages, and
            athletes can turn them off.
          </p>
        </>
      )}
    </section>
  );
}
