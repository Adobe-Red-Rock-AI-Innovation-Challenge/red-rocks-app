import { NIL_GO_THRESHOLD } from "@/lib/deals";
import type { Athlete, Offer } from "@/lib/types";

export type NilStatus = "green" | "yellow" | "red";
export type NilCheck = { label: string; status: NilStatus; detail: string };

const BLOCKED_CATEGORY =
  /\b(alcohol|beer|wine|bourbon|whiskey|vodka|spirits|tobacco|vape|cannabis|gambling|sportsbook|betting)\b/i;
const PAY_FOR_PLAY = /\b(per (?:meet )?win|per point|if you win|recruit\w*|transfer|enroll\w*)\b/i;
const SCHOOL_MARKS = /\b(university|logo|uniform|jersey|campus)\b/i;

// Rule-of-thumb screening for the demo. A real program sends these to its compliance office.
export function checkOffer(offer: Offer, athlete: Athlete): NilCheck[] {
  const text = `${offer.sponsorName} ${offer.title} ${offer.deliverables} ${offer.caption}`;
  const rateTotal = athlete.rateCard.reduce((sum, item) => sum + item.price, 0);

  return [
    BLOCKED_CATEGORY.test(text)
      ? {
          label: "Sponsor category",
          status: "red",
          detail: "Alcohol, tobacco, cannabis and gambling deals are not allowed.",
        }
      : { label: "Sponsor category", status: "green", detail: "No restricted category found." },
    PAY_FOR_PLAY.test(text)
      ? {
          label: "Pay for performance",
          status: "red",
          detail: "Pay cannot depend on results, recruiting or enrollment.",
        }
      : {
          label: "Pay for performance",
          status: "green",
          detail: "Pay is tied to deliverables only.",
        },
    /#(ad|sponsored)\b/i.test(offer.caption)
      ? { label: "Disclosure", status: "green", detail: "Caption includes a clear #ad." }
      : { label: "Disclosure", status: "yellow", detail: "Add #ad to the caption before posting." },
    SCHOOL_MARKS.test(text)
      ? {
          label: "School marks",
          status: "yellow",
          detail: "Uniforms, logos and campus settings need compliance approval.",
        }
      : { label: "School marks", status: "green", detail: "No school marks mentioned." },
    offer.price >= NIL_GO_THRESHOLD
      ? {
          label: "NIL Go",
          status: "yellow",
          detail: "$600 or more: submit to NIL Go and get clearance before work starts.",
        }
      : { label: "NIL Go", status: "green", detail: "Under $600 unless deals with this payer add up." },
    offer.price > rateTotal * 1.5
      ? {
          label: "Fair market value",
          status: "yellow",
          detail: `$${offer.price.toLocaleString("en-US")} is well above this rate card ($${rateTotal.toLocaleString("en-US")} total).`,
        }
      : { label: "Fair market value", status: "green", detail: "Price fits the rate card." },
  ];
}

export function worstStatus(checks: NilCheck[]): NilStatus {
  if (checks.some((check) => check.status === "red")) return "red";
  return checks.some((check) => check.status === "yellow") ? "yellow" : "green";
}
