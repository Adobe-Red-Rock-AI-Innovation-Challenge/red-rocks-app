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
  // Follower counts are not published, so they stay null until the athlete connects an account.
  followers: { instagram: number; tiktok: number } | null;
  engagementRate: number | null;
  image: string;
  instagram: string | null;
  careerHighs: Record<string, string>;
  bioUrl: string;
  // Both come from the official roster bio; empty when the bio doesn't list them.
  highlights: string[];
  interests: string | null;
  // Sample personal-brand tags for the demo; athletes replace them in Profile.
  personalityTags: string[];
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
  provider: "google" | "password" | "demo";
  picture?: string;
  isAdmin?: boolean;
  status?: MemberStatus;
};

export type MemberStatus = "pending" | "active";

export type PartnerRole = Exclude<Role, "fan">;

export type Member = {
  email: string;
  name: string;
  role: Role;
  status: MemberStatus;
  registered: boolean;
  profile: Record<string, string>;
};

export type Fan = Pick<DemoUser, "name" | "email">;

export type Membership = "duo" | "family" | "inner";

export type Purchase =
  | { kind: "membership"; plan: Membership }
  | { kind: "gift"; amount: number }
  | { kind: "quest"; questId: string; amount: number; message?: string }
  | { kind: "deal"; offerId: string; title: string; amount: number }
  | { kind: "product"; productId: string; athleteId: string };

export type Sale = {
  id: string;
  productId: string;
  athleteId: string;
  amount: number;
  athleteShare: number;
  createdAt: string;
  done?: boolean;
  // Set for athlete-made items such as a signed drop, which are not in the gift catalog.
  title?: string;
};

export type ChatMessage = { id: string; from: "fan" | "athlete"; text: string; createdAt: string };

export type Conversation = {
  id: string;
  athleteId: string;
  fanName: string;
  messages: ChatMessage[];
  blocked?: boolean;
  // The fan's membership when they last wrote; Inner Circle members are answered first.
  tier?: Membership;
  sample?: boolean;
};

export type AthleteCampaignKind = "clinic" | "drop";

// Campaigns an athlete creates and prices themselves: a youth clinic clubs and sponsors book,
// or a signed drop fans buy on /gifts.
export type AthleteCampaign = {
  id: string;
  athleteId: string;
  kind: AthleteCampaignKind;
  title: string;
  pitch: string;
  createdAt: string;
  clinic?: { date: string; seats: number; pricePerSeat: number; bookedBy?: string };
  drop?: { item: string; quantity: number; price: number; sold: number };
  sample?: boolean;
};

export type PlanItem = { start: number; end: number; text: string };

export type CampaignPlan = {
  bigIdea: string;
  months: string[];
  phases: { name: string; start: number; end: number; keyHook: string }[];
  rows: { channel: string; group: "Athletes" | "Fans" | "In person" | "PR"; items: PlanItem[] }[];
  research: {
    audienceInsight: string;
    whyTheseAthletes: string;
    facts: string[];
    assumptions: string[];
    risks: string[];
  };
  budget: { item: string; amount: number }[];
  kpis: { metric: string; target: string }[];
};

export type SavedCampaign = {
  id: string;
  sponsorName: string;
  athleteIds: string[];
  plan: CampaignPlan;
  createdAt: string;
};

export type ThankYou = { id: string; from: string; message: string; createdAt: string };

export type DemoNotification = {
  id: string;
  text: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type OfferStatus =
  | "inquiry"
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
  claims: number;
  redemptions: number;
  redeemedCodes: string[];
  packageId?: string;
  sample?: boolean;
  messages?: DealMessage[];
  tasks?: ProjectTask[];
};

export type DealMessage = {
  id: string;
  from: "sponsor" | "athlete";
  text: string;
  createdAt: string;
};

export type ProjectTask = {
  id: string;
  title: string;
  due: string | null;
  status: "todo" | "submitted" | "approved" | "changes";
  comments: DealMessage[];
};

export type AiFile = { id: string; name: string; content: string; url?: string };

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  athleteIds?: string[];
  files?: AiFile[];
  source?: "claude" | "demo" | "script";
  link?: { href: string; label: string };
  chips?: string[];
};

export type AiChat = {
  id: string;
  mode: "athlete" | "campaign" | "budget" | "free";
  script?: { id: string; step: number };
  title: string;
  createdAt: string;
  messages: AiChatMessage[];
};

export type BusinessProfile = {
  company: string;
  contact: string;
  phone: string;
  website: string;
  industry: string;
  about: string;
};

export type AthleteResponse = { athleteId: string; note: string; createdAt: string };

export type SponsorRequest = {
  id: string;
  sponsorName: string;
  title: string;
  service: string;
  date: string;
  budget: number;
  details: string;
  status: "open" | "filled";
  responses: AthleteResponse[];
  createdAt: string;
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
  fanCodes: Record<string, string>;
  sales: Sale[];
  conversations: Conversation[];
  athleteCampaigns: AthleteCampaign[];
  campaigns: SavedCampaign[];
  aiChats: AiChat[];
  businessProfile: BusinessProfile | null;
  requests: SponsorRequest[];
  rsvps: string[];
  thanks: ThankYou[];
  notifications: DemoNotification[];
  offers: Offer[];
  activeAthleteId: string;
  athleteProfiles: Record<string, AthleteProfile>;
  paidSessions: string[];
};
