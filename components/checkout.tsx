"use client";

import { Dialog } from "@base-ui/react/dialog";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { celebrate } from "@/lib/celebrate";
import { purchaseLabel } from "@/lib/checkout";
import { applyPurchase } from "@/lib/demo-store";
import type { Purchase } from "@/lib/types";

// With STRIPE_SECRET_KEY set the fan goes to Stripe's test checkout; otherwise this dialog stands in.
export function useCheckout(onPaid?: () => void) {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useDemo();
  const [simulated, setSimulated] = useState<Purchase | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay(purchase: Purchase) {
    if (!state.user) {
      toast("Sign in first to continue");
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchase),
      });
      if (!response.ok) throw new Error("Checkout failed");
      const { url } = await response.json();
      if (url) {
        window.location.assign(url);
        return;
      }
      setSimulated(purchase);
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function confirmSimulated() {
    if (!simulated) return;
    applyPurchase(simulated);
    setSimulated(null);
    celebrate();
    toast.success("Payment complete");
    onPaid?.();
  }

  const dialog = (
    <Dialog.Root open={simulated !== null} onOpenChange={(open) => !open && setSimulated(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          <Dialog.Title className="text-2xl">Test checkout</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {simulated && purchaseLabel(simulated)}. Simulated Stripe test mode: no card is charged.
          </Dialog.Description>
          <div className="mt-4 grid gap-3">
            <Field label="Test card">
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
            <Button size="lg" onClick={confirmSimulated}>
              Pay
            </Button>
            <Dialog.Close render={<Button variant="ghost" size="lg" />}>Cancel</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return { pay, busy, dialog };
}
