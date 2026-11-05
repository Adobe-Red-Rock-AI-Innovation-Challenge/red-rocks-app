"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { setDemoState } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

type Result = { ok: boolean; message: string };

// The fan shows their code at the counter; staff type it (or scan it with a QR reader that types
// into this box), and the redemption counts toward the campaign's results.
export function RedeemForm({ compact = false }: { compact?: boolean }) {
  const { state } = useDemo();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function redeem(event: FormEvent) {
    event.preventDefault();
    const entered = code.trim().toUpperCase();
    const issued = Object.values(state.fanCodes).includes(entered);
    const offer = state.offers.find((item) => entered.startsWith(`${item.code}-`));

    if (!issued || !offer) {
      setResult({ ok: false, message: "Code not found. Check the letters and try again." });
    } else if (offer.redeemedCodes.includes(entered)) {
      setResult({ ok: false, message: "Already used. Each code works once." });
    } else {
      setDemoState((current) => ({
        ...current,
        offers: current.offers.map((item) =>
          item.id === offer.id
            ? {
                ...item,
                redemptions: item.redemptions + 1,
                redeemedCodes: [...item.redeemedCodes, entered],
              }
            : item,
        ),
      }));
      setResult({ ok: true, message: `Valid! Give the member offer for "${offer.title}".` });
    }
    setCode("");
  }

  return (
    <div>
      <form onSubmit={redeem} className={cn("grid gap-3", compact && "sm:grid-cols-[1fr_auto] sm:items-end")}>
        <Field label="Fan code">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            autoComplete="off"
            className={cn("font-mono uppercase", compact ? "h-10" : "h-12 text-lg")}
            placeholder="SEGOS-1A2B-7F3C"
          />
        </Field>
        <Button type="submit" size="lg" className={compact ? "h-10" : "h-11"}>
          Check code
        </Button>
      </form>
      {result && (
        <p
          role="status"
          className={
            result.ok
              ? "mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 font-semibold text-green-800"
              : "mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 font-semibold text-red-800"
          }
        >
          {result.ok ? <CheckCircle2 /> : <XCircle />}
          {result.message}
        </p>
      )}
    </div>
  );
}
