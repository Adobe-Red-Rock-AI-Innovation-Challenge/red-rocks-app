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

export type DemoUser = {
  name: string;
  email: string;
  organization?: string;
  provider: "google" | "demo";
  picture?: string;
  isAdmin?: boolean;
  status?: MemberStatus;
};

export type MemberStatus = "pending" | "active";

export type Member = {
  email: string;
  name: string;
  role: Exclude<Role, "fan">;
  status: MemberStatus;
};

export type Fan = Pick<DemoUser, "name" | "email">;

export type Membership = "duo" | "family";

export type Purchase =
  | { kind: "membership"; plan: Membership }
  | { kind: "gift"; amount: number }
  | { kind: "quest"; questId: string; amount: number; message?: string }
  | { kind: "deal"; offerId: string; title: string; amount: number };

export type ThankYou = { id: string; from: string; message: string; createdAt: string };

export type DemoNotification = {
  id: string;
  text: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type OfferStatus =
  | "pending"
  | "negotiating"
  | "accepted"
  | "cleared"
  | "delivered"
  | "paid"
  | "reported"
  | "declined";

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
  code: string;
  redemptions: number;
  packageId?: string;
  sample?: boolean;
};

export type AthleteProfile = { bio: string; tags: string[]; rateCard: RateCardItem[] };

export type DemoState = {
  role: Role;
  user: DemoUser | null;
  fan: Fan | null;
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
