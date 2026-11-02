export type SponsorPackage = {
  id: "spotlight" | "meet-night" | "team";
  name: string;
  price: number;
  bestFor: string;
  includes: string[];
};

export const PLATFORM_FEE_PERCENT = 15;

// Prices are planning assumptions, to be checked against comparable NIL deals before launch.
export const sponsorPackages: SponsorPackage[] = [
  {
    id: "spotlight",
    name: "Athlete Spotlight",
    price: 1500,
    bestFor: "A local business testing NIL for the first time",
    includes: [
      "One athlete matched by AI",
      "One Reel and one story set",
      "A tracked offer code for members",
    ],
  },
  {
    id: "meet-night",
    name: "Meet Night",
    price: 5000,
    bestFor: "A brand that wants one big local moment",
    includes: [
      "Four athletes promote one meet-week offer",
      "A QR offer for every VIP Pass member",
      "A results report after the campaign",
    ],
  },
  {
    id: "team",
    name: "Team Package",
    price: 15000,
    bestFor: "A season partner who wants the whole roster",
    includes: [
      "Every athlete takes part and shares the fee",
      "A season-long tracked member offer",
      "Monthly results reports",
    ],
  },
];
