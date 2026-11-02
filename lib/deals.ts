import { notification, setDemoState } from "@/lib/demo-store";
import type { Offer, OfferStatus } from "@/lib/types";

export const NIL_GO_THRESHOLD = 600;

export const dealSteps: { status: OfferStatus; label: string }[] = [
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
    redemptions: 0,
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
    offers: state.offers.map((offer) =>
      offer.id === offerId ? { ...offer, ...changes } : offer,
    ),
    notifications: [notification(message, href), ...state.notifications],
  }));
}
