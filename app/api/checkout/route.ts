import { parsePurchase, purchaseAmount, purchaseLabel } from "@/lib/checkout";
import { findProduct } from "@/lib/gifts";

export async function POST(request: Request) {
  const purchase = parsePurchase(await request.json().catch(() => null));
  if (!purchase) return Response.json({ error: "Invalid purchase" }, { status: 400 });

  // No key means the client shows its simulated checkout instead.
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return Response.json({ url: null });

  // A live key would take real money, and this prototype only ever runs Stripe test mode.
  if (!secretKey.startsWith("sk_test_")) {
    return Response.json({ error: "Only Stripe test keys are allowed" }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const returnData = encodeURIComponent(JSON.stringify(purchase));
  const form = new URLSearchParams({
    mode: purchase.kind === "membership" ? "subscription" : "payment",
    success_url: `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}&purchase=${returnData}`,
    cancel_url: `${origin}${purchase.kind === "deal" ? "/business/projects" : "/fan/join"}`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(purchaseAmount(purchase) * 100),
    "line_items[0][price_data][product_data][name]": purchaseLabel(purchase),
  });
  if (purchase.kind === "membership") {
    form.set("line_items[0][price_data][recurring][interval]", "month");
  }
  // Stripe collects the mailing address, so this app never stores one.
  if (purchase.kind === "product" && findProduct(purchase.productId)?.shipped) {
    form.set("shipping_address_collection[allowed_countries][0]", "US");
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey}` },
    body: form,
  });
  const session = await response.json();

  if (!response.ok) {
    console.error("Stripe checkout failed", session.error?.message);
    return Response.json({ error: "Could not start checkout" }, { status: 502 });
  }
  return Response.json({ url: session.url });
}
