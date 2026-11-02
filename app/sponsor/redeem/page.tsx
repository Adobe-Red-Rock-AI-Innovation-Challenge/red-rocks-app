"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { setDemoState } from "@/lib/demo-store";

type Result = { ok: boolean; message: string };

// What a cashier opens at the counter: the fan shows their code, staff type it (or scan it with
// a QR reader that types into this box), and the redemption counts toward the campaign.
export default function RedeemPage() {
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
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-5xl">Redeem</h1>
      <p className="mt-2 text-muted-foreground">
        For your counter staff. Enter the code on the fan&apos;s VIP Pass.
      </p>
      <form onSubmit={redeem} className="mt-6 grid gap-3">
        <Field label="Fan code">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            autoComplete="off"
            className="h-12 font-mono text-lg uppercase"
            placeholder="SEGOS-1A2B-7F3C"
          />
        </Field>
        <Button type="submit" size="lg" className="h-11">
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
