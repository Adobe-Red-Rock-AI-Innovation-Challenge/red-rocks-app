export type Role = "fan" | "sponsor" | "athlete";

export type RateCardItem = { deliverable: string; price: number };

export type Athlete = {
  id: string;
  name: string;
  event: string;
  year: string;
  hometown: string;
  story: string;
  vibeTags: string[];
  interestTags: string[];
  followers: { instagram: number; tiktok: number };
  engagementRate: number;
  image: string;
  rateCard: RateCardItem[];
};

export type Sponsor = {
  id: string;
  name: string;
  category: string;
  location: string;
  audience: string;
  description: string;
};

export type Quest = {
  id: string;
  athleteId: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
};

export type VipEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  tier: "Duo" | "Family";
};

export type Reward = {
  id: string;
  sponsorId: string;
  title: string;
  description: string;
  code: string;
};

export type ImpactBaseline = {
  goal: number;
  fans: number;
  subscribers: { duo: number; family: number };
  pastQuestDollars: number;
  giftDollars: number;
  sponsorDeals: number;
  sponsorDealDollars: number;
};

export type DemoUser = {
  name: string;
  email: string;
  organization?: string;
  provider: "google" | "email";
  picture?: string;
};

export type Membership = "duo" | "family";

export type Purchase =
  | { kind: "membership"; plan: Membership }
  | { kind: "gift"; amount: number }
  | { kind: "quest"; questId: string; amount: number; message?: string };

export type ThankYou = { id: string; from: string; message: string; createdAt: string };

export type DemoNotification = {
  id: string;
  text: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type OfferStatus = "pending" | "accepted" | "negotiating" | "declined";

export type Offer = {
  id: string;
  sponsorName: string;
  athleteId: string;
  title: string;
  deliverables: string;
  price: number;
  timeline: string;
  caption: string;
  status: OfferStatus;
  counterPrice?: number;
  createdAt: string;
};

export type AthleteProfile = { bio: string; tags: string[]; rateCard: RateCardItem[] };

export type DemoState = {
  role: Role;
  user: DemoUser | null;
  accounts: DemoUser[];
  membership: Membership | null;
  giftDollars: number;
  questContributions: Record<string, number>;
  claimedRewards: string[];
  rsvps: string[];
  thanks: ThankYou[];
  notifications: DemoNotification[];
  offers: Offer[];
  activeAthleteId: string;
  athleteProfiles: Record<string, AthleteProfile>;
  paidSessions: string[];
};
