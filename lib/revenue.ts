import { SERVICE_FEE_PERCENT, sponsorPackages } from "@/lib/packages";

export type RevenueInputs = {
  existingDonors: number;
  reachableFans: number;
  paidPercent: number;
  monthlyPrice: number;
  monthsPerYear: number;
  fanSharePercent: number;
  spotlights: number;
  meetNights: number;
  teamPackages: number;
  serviceFeePercent: number;
  athletes: number;
};

const common = {
  existingDonors: 450,
  reachableFans: 12207,
  monthlyPrice: 12,
  monthsPerYear: 6,
  fanSharePercent: 100,
  serviceFeePercent: SERVICE_FEE_PERCENT,
  athletes: 15,
};

export const scenarios: Record<string, RevenueInputs> = {
  Conservative: { ...common, paidPercent: 2, spotlights: 8, meetNights: 2, teamPackages: 1 },
  Base: { ...common, paidPercent: 5, spotlights: 20, meetNights: 6, teamPackages: 3 },
  Stretch: { ...common, paidPercent: 10, spotlights: 40, meetNights: 8, teamPackages: 6 },
};

function packagePrice(id: string) {
  return sponsorPackages.find((item) => item.id === id)?.price ?? 0;
}

// Fan money reaches athletes at the share set (WRTH's promise is 100%); athletes keep every
// sponsor dollar, and the service fee sponsors add on top pays for operations.
export function projectRevenue(inputs: RevenueInputs) {
  const members = inputs.existingDonors + Math.round(inputs.reachableFans * (inputs.paidPercent / 100));
  const fanRevenue = members * inputs.monthlyPrice * inputs.monthsPerYear;
  const sponsorRevenue =
    inputs.spotlights * packagePrice("spotlight") +
    inputs.meetNights * packagePrice("meet-night") +
    inputs.teamPackages * packagePrice("team");
  const athleteDollars = sponsorRevenue + fanRevenue * (inputs.fanSharePercent / 100);

  return {
    members,
    fanRevenue,
    sponsorRevenue,
    athleteDollars,
    perAthlete: inputs.athletes > 0 ? athleteDollars / inputs.athletes : 0,
    operations: sponsorRevenue * (inputs.serviceFeePercent / 100) + fanRevenue * (1 - inputs.fanSharePercent / 100),
  };
}
