"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { FileCard } from "@/components/business/file-card";
import { useDemo } from "@/components/demo-provider";
import { cn } from "@/lib/utils";

const modeLabels = { athlete: "Athletes", campaign: "Campaign idea", budget: "Budget", free: "Question" };

export default function AiHistoryPage() {
  const { state } = useDemo();
  const chats = state.aiChats;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = chats.find((chat) => chat.id === openId) ?? chats[0];
  const files = chats.flatMap((chat) => chat.messages.flatMap((message) => message.files ?? []));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl">AI Assistant</h1>
          <p className="mt-1 text-muted-foreground">Your past conversations and the files they produced.</p>
        </div>
        <Link href="/business/assistant" className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-white">
          <Sparkles className="size-4" /> New conversation
        </Link>
      </div>

      {chats.length === 0 ? (
        <p className="mt-6 rounded-2xl border p-6 text-center text-muted-foreground">No conversations yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
          <ul aria-label="Conversations" className="grid content-start gap-2">
            {chats.map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(chat.id)}
                  className={cn("w-full rounded-xl border p-3 text-left", chat.id === open?.id && "border-primary ring-1 ring-primary")}
                >
                  <span className="line-clamp-2">{chat.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {modeLabels[chat.mode]} · {new Date(chat.createdAt).toLocaleDateString("en-US")}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {open && (
            <section aria-label="Conversation" className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl">{open.title}</h2>
                <Link href={`/business/assistant?chat=${open.id}`} className="text-sm text-primary underline">
                  Continue this conversation
                </Link>
              </div>
              <ol className="mt-4 grid gap-3">
                {open.messages.map((message) => (
                  <li
                    key={message.id}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                      message.role === "user" ? "justify-self-end bg-black text-white" : "bg-neutral-50",
                    )}
                  >
                    {message.text}
                    {message.files?.map((file) => (
                      <div key={file.id} className="mt-2">
                        <FileCard file={file} />
                      </div>
                    ))}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}

      {files.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl">Generated files</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
