import { PLATFORM_FEE_PERCENT, sponsorPackages } from "@/lib/packages";

export type RevenueInputs = {
  reachableFans: number;
  paidPercent: number;
  monthlyPrice: number;
  monthsPerYear: number;
  fanSharePercent: number;
  spotlights: number;
  meetNights: number;
  teamPackages: number;
  platformFeePercent: number;
  athletes: number;
};

const common = {
  reachableFans: 12207,
  monthlyPrice: 12,
  monthsPerYear: 6,
  platformFeePercent: PLATFORM_FEE_PERCENT,
  athletes: 17,
};

export const scenarios: Record<string, RevenueInputs> = {
  Conservative: {
    ...common,
    paidPercent: 2,
    fanSharePercent: 40,
    spotlights: 8,
    meetNights: 2,
    teamPackages: 1,
  },
  Base: {
    ...common,
    paidPercent: 5,
    fanSharePercent: 50,
    spotlights: 20,
    meetNights: 6,
    teamPackages: 3,
  },
  Stretch: {
    ...common,
    paidPercent: 10,
    fanSharePercent: 60,
    spotlights: 40,
    meetNights: 8,
    teamPackages: 6,
  },
};

function packagePrice(id: string) {
  return sponsorPackages.find((item) => item.id === id)?.price ?? 0;
}

export function projectRevenue(inputs: RevenueInputs) {
  const members = Math.round(inputs.reachableFans * (inputs.paidPercent / 100));
  const fanRevenue = members * inputs.monthlyPrice * inputs.monthsPerYear;
  const sponsorRevenue =
    inputs.spotlights * packagePrice("spotlight") +
    inputs.meetNights * packagePrice("meet-night") +
    inputs.teamPackages * packagePrice("team");
  const athleteDollars =
    sponsorRevenue * (1 - inputs.platformFeePercent / 100) +
    fanRevenue * (inputs.fanSharePercent / 100);

  return {
    members,
    fanRevenue,
    sponsorRevenue,
    athleteDollars,
    perAthlete: inputs.athletes > 0 ? athleteDollars / inputs.athletes : 0,
    operations: sponsorRevenue + fanRevenue - athleteDollars,
  };
}
