import { ATHLETE_SHARE_PERCENT } from "@/lib/gifts";
import { SERVICE_FEE_PERCENT, sponsorPackages } from "@/lib/packages";

export type RevenueInputs = {
  existingDonors: number;
  reachableFans: number;
  paidPercent: number;
  monthlyPrice: number;
  monthsPerYear: number;
  oneTimeSupports: number;
  oneTimeAverage: number;
  fanSharePercent: number;
  spotlights: number;
  meetNights: number;
  anchorPartners: number;
  clinics: number;
  pitchedCampaigns: number;
  signedDrops: number;
  serviceFeePercent: number;
  athletes: number;
};

// The season target every page counts toward, with the slide's quarterly milestones.
export const NIL_GOAL = 2_000_000;
export const QUARTER_MILESTONES = [250_000, 750_000, 1_500_000, 2_000_000];

// Athlete-run campaigns: planning prices, not athlete rates. Signed drops pay athletes the gift share.
export const CLINIC_PRICE = 5000;
export const PITCHED_CAMPAIGN_PRICE = 5000;
export const SIGNED_DROP_PRICE = 35;

const common = {
  existingDonors: 450,
  reachableFans: 9800,
  monthlyPrice: 15,
  monthsPerYear: 12,
  oneTimeAverage: 20,
  fanSharePercent: 100,
  serviceFeePercent: SERVICE_FEE_PERCENT,
  athletes: 15,
};

export const DEFAULT_SCENARIO = "$2M Plan";

export const scenarios: Record<string, RevenueInputs> = {
  Conservative: {
    ...common,
    paidPercent: 5,
    oneTimeSupports: 2000,
    spotlights: 20,
    meetNights: 4,
    anchorPartners: 0,
    clinics: 5,
    pitchedCampaigns: 5,
    signedDrops: 1000,
  },
  Base: {
    ...common,
    paidPercent: 15,
    oneTimeSupports: 4000,
    spotlights: 40,
    meetNights: 10,
    anchorPartners: 2,
    clinics: 10,
    pitchedCampaigns: 15,
    signedDrops: 3000,
  },
  [DEFAULT_SCENARIO]: {
    ...common,
    paidPercent: 26,
    oneTimeSupports: 8000,
    spotlights: 60,
    meetNights: 20,
    anchorPartners: 4,
    clinics: 20,
    pitchedCampaigns: 30,
    signedDrops: 6000,
  },
};

function packagePrice(id: string) {
  return sponsorPackages.find((item) => item.id === id)?.price ?? 0;
}

// Fan money reaches athletes at the share set (WRTH's promise is 100%); athletes keep every
// sponsor dollar, and the service fee sponsors add on top pays for operations, outside the goal.
export function projectRevenue(inputs: RevenueInputs) {
  const members = inputs.existingDonors + Math.round(inputs.reachableFans * (inputs.paidPercent / 100));
  const membershipRevenue = members * inputs.monthlyPrice * inputs.monthsPerYear;
  const fanRevenue = membershipRevenue + inputs.oneTimeSupports * inputs.oneTimeAverage;
  const sponsorRevenue =
    inputs.spotlights * packagePrice("spotlight") +
    inputs.meetNights * packagePrice("meet-night") +
    inputs.anchorPartners * packagePrice("anchor");
  const athleteCampaigns =
    inputs.clinics * CLINIC_PRICE +
    inputs.pitchedCampaigns * PITCHED_CAMPAIGN_PRICE +
    inputs.signedDrops * SIGNED_DROP_PRICE * (ATHLETE_SHARE_PERCENT / 100);
  const athleteDollars = sponsorRevenue + athleteCampaigns + fanRevenue * (inputs.fanSharePercent / 100);

  return {
    members,
    membershipRevenue,
    fanRevenue,
    sponsorRevenue,
    athleteCampaigns,
    athleteDollars,
    perAthlete: inputs.athletes > 0 ? athleteDollars / inputs.athletes : 0,
    serviceFees: sponsorRevenue * (inputs.serviceFeePercent / 100),
  };
}
