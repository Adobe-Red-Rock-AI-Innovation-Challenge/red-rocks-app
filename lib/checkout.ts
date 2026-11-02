import { quests } from "@/lib/data";
import type { Membership, Purchase } from "@/lib/types";

export const plans: Record<Membership, { name: string; price: number; perks: string[] }> = {
  duo: {
    name: "Duo",
    price: 10,
    perks: ["Digital VIP Pass", "Sponsor rewards", "Duo-tier events"],
  },
  family: {
    name: "Family",
    price: 25,
    perks: ["Everything in Duo", "Family-tier events", "Passes for up to 4 fans"],
  },
};

export const MIN_SUPPORT = 5;
export const MAX_SUPPORT = 500;

export function purchaseAmount(purchase: Purchase) {
  return purchase.kind === "membership" ? plans[purchase.plan].price : purchase.amount;
}

export function purchaseLabel(purchase: Purchase) {
  if (purchase.kind === "membership") {
    return `${plans[purchase.plan].name} membership, $${plans[purchase.plan].price}/month`;
  }
  if (purchase.kind === "gift") return `One-time gift, $${purchase.amount}`;
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
    return purchase.plan === "duo" || purchase.plan === "family"
      ? { kind: "membership", plan: purchase.plan }
      : null;
  }
  if (purchase.kind === "gift" && validAmount(purchase.amount)) {
    return { kind: "gift", amount: purchase.amount };
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
