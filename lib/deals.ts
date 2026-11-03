import { notification, setDemoState } from "@/lib/demo-store";
import type { DealMessage, Offer, OfferStatus, ProjectTask } from "@/lib/types";

export const NIL_GO_THRESHOLD = 600;

export const dealSteps: { status: OfferStatus; label: string }[] = [
  { status: "inquiry", label: "Request" },
  { status: "pending", label: "Offer" },
  { status: "negotiating", label: "Negotiate" },
  { status: "accepted", label: "Accepted" },
  { status: "cleared", label: "NIL Go" },
  { status: "delivered", label: "Delivered" },
  { status: "paid", label: "Paid" },
  { status: "reported", label: "Results" },
];

export const liveStatuses: OfferStatus[] = ["cleared", "delivered", "paid", "reported"];

export function dealStepIndex(status: OfferStatus) {
  return dealSteps.findIndex((step) => step.status === status);
}

export function isLive(offer: Offer) {
  return liveStatuses.includes(offer.status);
}

// Deals with the same payer count together toward the threshold, so split deals still report.
export function needsNilGo(offer: Offer, offers: Offer[]) {
  const total = offers
    .filter(
      (item) =>
        item.athleteId === offer.athleteId &&
        item.sponsorName === offer.sponsorName &&
        item.status !== "declined",
    )
    .reduce((sum, item) => sum + item.price, 0);
  return total >= NIL_GO_THRESHOLD;
}

function campaignCode(sponsorName: string) {
  const prefix = sponsorName.replace(/[^a-z]/gi, "").slice(0, 5).toUpperCase();
  return `${prefix}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

export function newOffer(
  fields: Pick<
    Offer,
    "sponsorName" | "athleteId" | "title" | "deliverables" | "price" | "timeline" | "caption"
  > & { packageId?: string },
): Offer {
  return {
    ...fields,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    code: campaignCode(fields.sponsorName),
    claims: 0,
    redemptions: 0,
    redeemedCodes: [],
  };
}

export function updateOffer(
  offerId: string,
  changes: Partial<Offer>,
  message: string,
  href: string,
) {
  setDemoState((state) => ({
    ...state,
    offers: state.offers.map((offer) => {
      if (offer.id !== offerId) return offer;
      const next = { ...offer, ...changes };
      // A deal becomes a project once accepted, so it gets a starter task list.
      const started = next.status === "accepted" || next.status === "cleared";
      return started && !next.tasks ? { ...next, tasks: starterTasks() } : next;
    }),
    notifications: [notification(message, href), ...state.notifications],
  }));
}

function starterTasks(): ProjectTask[] {
  return ["Share a content draft for review", "Post the approved content", "Send a results screenshot"].map(
    (title) => ({ id: crypto.randomUUID(), title, due: null, status: "todo", comments: [] }),
  );
}

export function dealMessage(from: DealMessage["from"], text: string): DealMessage {
  return { id: crypto.randomUUID(), from, text: text.trim(), createdAt: new Date().toISOString() };
}

export function sendDealMessage(offer: Offer, from: DealMessage["from"], text: string) {
  setDemoState((state) => ({
    ...state,
    offers: state.offers.map((item) =>
      item.id === offer.id ? { ...item, messages: [...(item.messages ?? []), dealMessage(from, text)] } : item,
    ),
    notifications: [
      notification(
        from === "sponsor" ? `New message from ${offer.sponsorName}` : `An athlete replied about "${offer.title}"`,
        from === "sponsor" ? "/athlete/dashboard" : "/business/requests",
      ),
      ...state.notifications,
    ],
  }));
}

export function updateTask(offerId: string, taskId: string, change: (task: ProjectTask) => ProjectTask) {
  setDemoState((state) => ({
    ...state,
    offers: state.offers.map((offer) =>
      offer.id === offerId
        ? { ...offer, tasks: (offer.tasks ?? []).map((task) => (task.id === taskId ? change(task) : task)) }
        : offer,
    ),
  }));
}

export function addTask(offerId: string, title: string, due: string | null) {
  setDemoState((state) => ({
    ...state,
    offers: state.offers.map((offer) =>
      offer.id === offerId
        ? {
            ...offer,
            tasks: [
              ...(offer.tasks ?? []),
              { id: crypto.randomUUID(), title: title.trim(), due, status: "todo", comments: [] },
            ],
          }
        : offer,
    ),
  }));
}
