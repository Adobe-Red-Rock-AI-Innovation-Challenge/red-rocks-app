export type SponsorPackage = {
  id: "spotlight" | "meet-night" | "anchor";
  name: string;
  price: number;
  priceNote?: string;
  bestFor: string;
  includes: string[];
};

// Athletes keep 100% of every price; sponsors pay this service fee on top to run the hub.
export const SERVICE_FEE_PERCENT = 15;

// Prices are planning assumptions, to be checked against comparable NIL deals before launch.
export const sponsorPackages: SponsorPackage[] = [
  {
    id: "spotlight",
    name: "Athlete Spotlight",
    price: 2500,
    bestFor: "A small business near campus",
    includes: [
      "One athlete matched by AI",
      "One Reel and one story set",
      "A tracked offer code for members",
    ],
  },
  {
    id: "meet-night",
    name: "Meet Night",
    price: 7500,
    bestFor: "A mid-size Utah brand that wants one big local moment",
    includes: [
      "Four athletes promote one meet-week offer",
      "A QR offer for every VIP Pass member",
      "A results report after the campaign",
    ],
  },
  {
    id: "anchor",
    name: "Anchor Partner",
    price: 150000,
    priceNote: "per season",
    bestFor: "A season partner who wants the whole roster",
    includes: [
      "Every athlete takes part and shares the fee",
      "A season-long tracked member offer",
      "Monthly results reports",
      "“Presented by” credit on the meet-day Live TikTok",
    ],
  },
];
