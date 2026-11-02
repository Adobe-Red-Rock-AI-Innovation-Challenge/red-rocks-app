"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button";
import { celebrate } from "@/lib/celebrate";
import { parsePurchase } from "@/lib/checkout";
import { applyPurchase } from "@/lib/demo-store";

const noSubscription = () => () => {};

function readReturn(search: string) {
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");
  try {
    const purchase = parsePurchase(JSON.parse(params.get("purchase") ?? ""));
    return purchase && sessionId ? { purchase, sessionId } : null;
  } catch {
    return null;
  }
}

// Stripe returns here after a test payment. The browser, not a webhook, records it for the demo.
export default function CheckoutCompletePage() {
  const search = useSyncExternalStore(
    noSubscription,
    () => window.location.search,
    () => null,
  );
  const failed = search !== null && readReturn(search) === null;
  const isDeal = search !== null && readReturn(search)?.purchase.kind === "deal";

  useEffect(() => {
    const result = search === null ? null : readReturn(search);
    if (!result) return;
    applyPurchase(result.purchase, result.sessionId);
    celebrate();
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
      <h1 className="text-4xl">{failed ? "Payment not found" : "You're in!"}</h1>
      <p className="mt-2 text-muted-foreground">
        {failed ? "We could not read this payment." : "Thank you for supporting Red Rocks."}
      </p>
      <Link
        href={isDeal ? "/sponsor/deals" : "/fan/dashboard"}
        className={buttonVariants({ size: "lg", className: "mt-6 px-4" })}
      >
        {isDeal ? "Back to deals" : "Go to My Pass"}
      </Link>
    </div>
  );
}
