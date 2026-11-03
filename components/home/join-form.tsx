"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 w-full rounded-full bg-white px-4 text-sm outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-primary";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-left text-xs">
      <span className="pl-3">{label}</span>
      {children}
    </label>
  );
}

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
        body: JSON.stringify({ kind, ...Object.fromEntries(form) }),
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
              "rounded-full py-1.5 text-sm",
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
            href={kind === "partner" ? "/sponsor/packages" : "/fan-club"}
            className="rounded-full bg-black py-2.5 text-white"
          >
            {kind === "partner" ? "See sponsor packages" : "Visit the Fan Club"}
          </Link>
        </div>
      ) : (
        <form key={kind} onSubmit={submit} className="mt-4 grid gap-3">
          {kind === "partner" ? (
            <>
              <Labeled label="Work email address">
                <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={fieldClass} />
              </Labeled>
              <Labeled label="Company / brand name">
                <input name="company" required autoComplete="organization" maxLength={200} className={fieldClass} />
              </Labeled>
              <Labeled label="Partnership interest">
                <select name="interest" defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {["NIL & influencer deals", "In-arena branding", "Team package", "Not sure yet"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </Labeled>
            </>
          ) : (
            <>
              <Labeled label="Full name">
                <input name="name" required autoComplete="name" maxLength={120} className={fieldClass} />
              </Labeled>
              <Labeled label="Date of birth">
                <input name="birthDate" type="date" required autoComplete="bday" className={fieldClass} />
              </Labeled>
              <Labeled label="Email">
                <input name="email" type="email" required autoComplete="email" className={fieldClass} />
              </Labeled>
              <Labeled label="Phone (optional)">
                <input name="phone" type="tel" autoComplete="tel" maxLength={30} className={fieldClass} />
              </Labeled>
            </>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex h-10 items-center justify-between rounded-full bg-black pr-1.5 pl-4 text-sm text-white disabled:opacity-60"
          >
            {busy ? "Sending..." : "Here we go!"}
            <ArrowUpRight className="size-7 rounded-full bg-white p-1.5 text-black" />
          </button>
          <p className="text-xs text-muted-foreground">
            {kind === "fan" && "Fans under 13 need a parent to sign up. "}
            We only use your details to follow up. See our{" "}
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
