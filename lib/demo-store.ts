import { purchaseLabel } from "@/lib/checkout";
import { athletes, quests } from "@/lib/data";
import type { DemoNotification, DemoState, DemoUser, Purchase, Role } from "@/lib/types";

const STORAGE_KEY = "red-rocks-demo-v2";

export const initialState: DemoState = {
  role: "fan",
  user: null,
  fan: null,
  membership: null,
  giftDollars: 0,
  questContributions: {},
  claimedRewards: [],
  rsvps: [],
  thanks: [],
  notifications: [],
  offers: [
    {
      id: "seed-second-peak",
      sponsorName: "Second Peak Coffee",
      athleteId: "mara-ellison",
      title: "Meet-day latte Reel",
      deliverables: "One Instagram Reel and a 3-frame story set at the Second Peak counter.",
      price: 1100,
      timeline: "Film by Dec 5, post by Dec 12",
      caption: "Fueling meet day with @secondpeakcoffee. #ad",
      status: "pending",
      createdAt: "2026-10-28T16:00:00.000Z",
      code: "PEAK-MARA",
      redemptions: 0,
    },
    {
      id: "seed-canyon-spirits",
      sponsorName: "Canyon Spirits",
      athleteId: "mara-ellison",
      title: "Bourbon tasting night",
      deliverables: "One Instagram post wearing team uniform at a bourbon tasting.",
      price: 4000,
      timeline: "Post by Nov 20",
      caption: "Cheers to the season!",
      status: "pending",
      createdAt: "2026-10-30T16:00:00.000Z",
      code: "CANYON-MARA",
      redemptions: 0,
    },
    {
      id: "seed-sego-results",
      sponsorName: "Sego Smoothie Co.",
      athleteId: "kennedy-okafor",
      title: "Post-workout smoothie Reel",
      deliverables: "One Instagram Reel with a member-only smoothie offer.",
      price: 900,
      timeline: "Ran Sept 8 to Sept 22",
      caption: "My post-workout go-to from @segosmoothie. #ad",
      status: "reported",
      createdAt: "2026-09-01T16:00:00.000Z",
      code: "SEGO-KEN",
      redemptions: 94,
      sample: true,
    },
    {
      id: "seed-sego-renewal",
      sponsorName: "Sego Smoothie Co.",
      athleteId: "josie-whitlock",
      title: "Fall smoothie story set",
      deliverables: "A 3-frame story set with a member-only offer.",
      price: 300,
      timeline: "Ran Oct 6 to Oct 13",
      caption: "Fall flavors from @segosmoothie. #ad",
      status: "reported",
      createdAt: "2026-10-01T16:00:00.000Z",
      code: "SEGO-JOSIE",
      redemptions: 41,
      sample: true,
    },
  ],
  activeAthleteId: athletes[0].id,
  athleteProfiles: {},
  paidSessions: [],
};

const listeners = new Set<() => void>();
let current: DemoState | null = null;

function load(): DemoState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  } catch {
    return initialState;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSnapshot(): DemoState {
  current ??= load();
  return current;
}

export function getServerSnapshot(): DemoState {
  return initialState;
}

export function subscribe(listener: () => void) {
  // The storage event keeps a second tab in sync, e.g. sponsor and athlete side by side.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = load();
    emit();
  };

  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setDemoState(update: (state: DemoState) => DemoState) {
  current = update(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Blocked storage only loses persistence; the demo keeps working in memory.
  }
  emit();
}

export function resetDemoState() {
  setDemoState(() => initialState);
}

export function notification(text: string, href: string): DemoNotification {
  return {
    id: crypto.randomUUID(),
    text,
    href,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export function signIn(user: DemoUser, role?: Role) {
  setDemoState((state) => ({ ...state, user, role: role ?? state.role }));
}

export async function signOut() {
  setDemoState((state) => ({ ...state, user: null }));
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
}

export function deleteFanData() {
  setDemoState((state) => ({
    ...state,
    fan: null,
    membership: null,
    giftDollars: 0,
    questContributions: {},
    claimedRewards: [],
    rsvps: [],
    thanks: [],
    notifications: [],
    paidSessions: [],
  }));
}

function thankYouFor(purchase: Exclude<Purchase, { kind: "deal" }>) {
  if (purchase.kind === "membership") {
    return {
      from: "Red Rocks Team",
      message: "Welcome to the community. Your VIP Pass is ready. See you at the next meet!",
    };
  }
  if (purchase.kind === "gift") {
    return {
      from: "Red Rocks Team",
      message: `Thank you for your $${purchase.amount} gift. It goes straight to the team.`,
    };
  }
  const quest = quests.find((item) => item.id === purchase.questId);
  const athlete = athletes.find((item) => item.id === quest?.athleteId);
  return {
    from: athlete?.name ?? "Red Rocks Team",
    message: `Thank you for backing ${quest?.title ?? "my quest"}! ${
      purchase.message ? "Your note made my day." : "It means so much."
    }`,
  };
}

// Stripe sends the browser back with a session id; recording it stops a refresh paying twice.
export function applyPurchase(purchase: Purchase, sessionId?: string) {
  setDemoState((state) => {
    if (sessionId && state.paidSessions.includes(sessionId)) return state;
    const paidSessions = sessionId ? [...state.paidSessions, sessionId] : state.paidSessions;

    if (purchase.kind === "deal") {
      return {
        ...state,
        paidSessions,
        offers: state.offers.map((offer) =>
          offer.id === purchase.offerId ? { ...offer, status: "paid" } : offer,
        ),
        notifications: [
          notification(`Payment sent for "${purchase.title}"`, "/athlete/dashboard"),
          ...state.notifications,
        ],
      };
    }

    return {
      ...state,
      paidSessions,
      membership: purchase.kind === "membership" ? purchase.plan : state.membership,
      giftDollars: state.giftDollars + (purchase.kind === "gift" ? purchase.amount : 0),
      questContributions:
        purchase.kind === "quest"
          ? {
              ...state.questContributions,
              [purchase.questId]:
                (state.questContributions[purchase.questId] ?? 0) + purchase.amount,
            }
          : state.questContributions,
      thanks: [
        {
          ...thankYouFor(purchase),
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...state.thanks,
      ],
      notifications: [
        notification(`Payment received: ${purchaseLabel(purchase)}`, "/fan/dashboard"),
        ...state.notifications,
      ],
    };
  });
}
