import { quests } from "@/lib/data";
import type { Membership, Purchase } from "@/lib/types";

export const plans: Record<Membership, { name: string; price: number; perks: string[] }> = {
  duo: {
    name: "Red Rocks Insider",
    price: 10,
    perks: ["Digital VIP Pass", "Sponsor rewards", "Insider events"],
  },
  family: {
    name: "Red Rocks All-Access",
    price: 25,
    perks: ["Everything in Insider", "All-Access events", "Passes for up to 4 fans"],
  },
  inner: {
    name: "Red Rocks Inner Circle",
    price: 50,
    perks: ["Everything in All-Access", "Post-meet athlete meet and greet", "Signed season poster"],
  },
};

export const MIN_SUPPORT = 5;
export const MAX_SUPPORT = 500;

const MIN_DEAL = 100;
const MAX_DEAL = 50000;

export function purchaseAmount(purchase: Purchase) {
  return purchase.kind === "membership" ? plans[purchase.plan].price : purchase.amount;
}

export function purchaseLabel(purchase: Purchase) {
  if (purchase.kind === "membership") {
    return `${plans[purchase.plan].name} membership, $${plans[purchase.plan].price}/month`;
  }
  if (purchase.kind === "gift") return `Season supporter, $${purchase.amount}`;
  if (purchase.kind === "deal") return `NIL deal: ${purchase.title}, $${purchase.amount}`;
  const quest = quests.find((item) => item.id === purchase.questId);
  return `${quest?.title ?? "Quest"} support, $${purchase.amount}`;
}

function validAmount(amount: unknown): amount is number {
  return (
    typeof amount === "number" &&
    Number.isInteger(amount) &&
    amount >= MIN_SUPPORT &&
    amount <= MAX_SUPPORT
  );
}

// Purchases cross the network, so the server never trusts an amount it has not checked here.
export function parsePurchase(value: unknown): Purchase | null {
  if (typeof value !== "object" || value === null) return null;
  const purchase = value as Record<string, unknown>;

  if (purchase.kind === "membership") {
    return purchase.plan === "duo" || purchase.plan === "family" || purchase.plan === "inner"
      ? { kind: "membership", plan: purchase.plan }
      : null;
  }
  if (purchase.kind === "gift" && validAmount(purchase.amount)) {
    return { kind: "gift", amount: purchase.amount };
  }
  if (
    purchase.kind === "deal" &&
    typeof purchase.offerId === "string" &&
    typeof purchase.title === "string" &&
    typeof purchase.amount === "number" &&
    Number.isInteger(purchase.amount) &&
    purchase.amount >= MIN_DEAL &&
    purchase.amount <= MAX_DEAL
  ) {
    return {
      kind: "deal",
      offerId: purchase.offerId,
      title: purchase.title.slice(0, 120),
      amount: purchase.amount,
    };
  }
  if (
    purchase.kind === "quest" &&
    validAmount(purchase.amount) &&
    quests.some((quest) => quest.id === purchase.questId)
  ) {
    return {
      kind: "quest",
      questId: purchase.questId as string,
      amount: purchase.amount,
      message: typeof purchase.message === "string" ? purchase.message.slice(0, 500) : undefined,
    };
  }
  return null;
}
