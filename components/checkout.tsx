"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { celebrate } from "@/lib/celebrate";
import { purchaseAmount, purchaseLabel } from "@/lib/checkout";
import { applyPurchase, setDemoState } from "@/lib/demo-store";
import type { Purchase } from "@/lib/types";

type Pending = { purchase: Purchase; stripeUrl: string | null };

// One form, like a hosted payment page. With STRIPE_SECRET_KEY set, card details are typed on
// Stripe's own page and never reach this app; without it the card fields are a labeled test stand-in.
export function useCheckout(onPaid?: () => void) {
  const { state } = useDemo();
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const needsDetails = !state.fan && pending?.purchase.kind !== "deal";

  async function pay(purchase: Purchase) {
    setBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchase),
      });
      if (!response.ok) throw new Error("Checkout failed");
      const { url } = await response.json();
      setPending({ purchase, stripeUrl: url });
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending) return;

    if (needsDetails) {
      const form = new FormData(event.currentTarget);
      const fan = {
        name: String(form.get("name")).trim(),
        email: String(form.get("email")).trim().toLowerCase(),
      };
      setDemoState((current) => ({ ...current, fan }));
    }
    if (pending.stripeUrl) {
      window.location.assign(pending.stripeUrl);
      return;
    }

    applyPurchase(pending.purchase);
    setPending(null);
    celebrate();
    toast.success("Payment complete");
    onPaid?.();
  }

  const dialog = (
    <Dialog.Root open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-background shadow-lg">
          {pending && (
            <>
              <div className="border-b bg-neutral-50 p-5">
                <Dialog.Title className="text-sm font-normal text-muted-foreground normal-case">
                  Make a payment to
                </Dialog.Title>
                <p className="font-heading text-xl font-extrabold uppercase">Red Rocks Fan Hub</p>
                <Dialog.Description className="text-sm">
                  {purchaseLabel(pending.purchase)}
                </Dialog.Description>
              </div>
              <form onSubmit={submit} className="grid gap-3 p-5">
                <Field label="Amount to pay">
                  <Input value={`${purchaseAmount(pending.purchase).toFixed(2)} USD`} readOnly />
                </Field>
                {needsDetails && (
                  <>
                    <Field label="Name on your VIP Pass">
                      <Input name="name" required autoComplete="name" />
                    </Field>
                    <Field label="Email for your receipt">
                      <Input name="email" type="email" required autoComplete="email" />
                    </Field>
                  </>
                )}
                {pending.stripeUrl ? (
                  <p className="text-xs text-muted-foreground">
                    You enter your card on Stripe&apos;s secure page next. We never see or store
                    card numbers.
                  </p>
                ) : (
                  <>
                    <Field label="Card number (test)">
                      <Input value="4242 4242 4242 4242" readOnly />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry">
                        <Input value="12 / 34" readOnly />
                      </Field>
                      <Field label="CVC">
                        <Input value="123" readOnly />
                      </Field>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Test mode: no real card is charged.
                    </p>
                  </>
                )}
                {needsDetails && (
                  <p className="text-xs text-muted-foreground">
                    We use your name and email only for your pass and receipt. See our{" "}
                    <Link href="/privacy" className="underline">
                      privacy notice
                    </Link>
                    .
                  </p>
                )}
                <Button type="submit" size="lg" className="h-11">
                  <Lock />
                  {pending.stripeUrl ? "Continue to secure payment" : "Pay now"}
                </Button>
                <Dialog.Close render={<Button type="button" variant="ghost" size="lg" />}>
                  Cancel
                </Dialog.Close>
              </form>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return { pay, busy, dialog };
}
