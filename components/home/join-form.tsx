"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 w-full rounded-full bg-white px-4 text-sm outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary";

export function JoinForm() {
  const [kind, setKind] = useState<"partner" | "fan">("partner");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          email: form.get("email"),
          company: form.get("company"),
          interest: form.get("interest"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSent(true);
      toast.success(kind === "partner" ? "Thanks! Our partnerships team will reach out." : "Welcome to Red Rock Nation!");
    } catch (error) {
      toast.error((error as Error).message || "Could not send. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="join" className="mx-auto w-full max-w-sm scroll-mt-28 text-center">
      <h2 className="text-2xl">Join Us Now</h2>
      <div role="tablist" aria-label="I am joining as" className="mt-4 grid grid-cols-2 gap-2">
        {(
          [
            ["partner", "Brand Partner"],
            ["fan", "Red Rock Nation"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={kind === id}
            onClick={() => {
              setKind(id);
              setSent(false);
            }}
            className={cn(
              "rounded-full py-1.5 text-sm font-semibold",
              kind === id ? "bg-primary text-white" : "bg-white text-muted-foreground ring-1 ring-neutral-200",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {sent ? (
        <div className="mt-6 grid gap-3 text-sm">
          <p>Got it. Want to start right away?</p>
          <Link
            href={kind === "partner" ? "/sponsor/packages" : "/fan/join"}
            className="rounded-full bg-neutral-950 py-2.5 font-semibold text-white"
          >
            {kind === "partner" ? "See sponsor packages" : "Get your VIP Pass"}
          </Link>
        </div>
      ) : (
        <form key={kind} onSubmit={submit} className="mt-4 grid gap-3 text-left">
          <input
            name="email"
            type="email"
            required
            aria-label={kind === "partner" ? "Work email address" : "Email address"}
            placeholder={kind === "partner" ? "Work Email Address" : "Email Address"}
            className={fieldClass}
          />
          {kind === "partner" && (
            <input
              name="company"
              required
              aria-label="Company or brand name"
              placeholder="Company / Brand name"
              className={fieldClass}
            />
          )}
          <select name="interest" aria-label="What are you interested in?" defaultValue="" className={fieldClass}>
            <option value="" disabled>
              {kind === "partner" ? "Partnership Interest" : "What do you want most?"}
            </option>
            {(kind === "partner"
              ? ["Athlete Spotlight", "Meet Night", "Team Package", "Not sure yet"]
              : ["Meet updates", "Athlete content", "Sponsor rewards", "VIP events"]
            ).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="flex h-10 items-center justify-between rounded-full bg-neutral-950 pr-1.5 pl-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Sending..." : "Here we go!"}
            <ArrowUpRight className="size-7 rounded-full bg-white p-1.5 text-neutral-950" />
          </button>
          <p className="text-center text-xs text-muted-foreground">
            We only use your email to follow up. See our{" "}
            <Link href="/privacy" className="underline">
              privacy notice
            </Link>
            .
          </p>
        </form>
      )}
    </section>
  );
}
