import { athletes } from "@/lib/data";
import { notification, setDemoState } from "@/lib/demo-store";
import { athleteShare } from "@/lib/gifts";
import type { AthleteCampaign, DemoState } from "@/lib/types";

export const CLINIC_TARGET = 5000;
export const DROP_SUGGESTED_PRICE = 35;
export const DROP_ITEMS = ["Signed photo card", "Signed poster"];

export function clinicTotal(campaign: AthleteCampaign) {
  return campaign.clinic ? campaign.clinic.seats * campaign.clinic.pricePerSeat : 0;
}

// What athletes have earned from their own campaigns: booked clinics in full, drops at the gift share.
export function athleteCampaignDollars(state: DemoState) {
  return state.athleteCampaigns.reduce(
    (sum, campaign) =>
      sum +
      (campaign.clinic?.bookedBy ? clinicTotal(campaign) : 0) +
      (campaign.drop ? campaign.drop.sold * athleteShare(campaign.drop.price) : 0),
    0,
  );
}

export function publishCampaign(campaign: AthleteCampaign) {
  setDemoState((state) => ({
    ...state,
    athleteCampaigns: [campaign, ...state.athleteCampaigns],
  }));
}

export function bookClinic(campaignId: string, sponsorName: string) {
  setDemoState((state) => {
    const campaign = state.athleteCampaigns.find((item) => item.id === campaignId);
    if (!campaign?.clinic || campaign.clinic.bookedBy) return state;
    return {
      ...state,
      athleteCampaigns: state.athleteCampaigns.map((item) =>
        item.id === campaignId && item.clinic
          ? { ...item, clinic: { ...item.clinic, bookedBy: sponsorName } }
          : item,
      ),
      notifications: [
        notification(`${sponsorName} booked your clinic "${campaign.title}"`, "/athlete/opportunities"),
        ...state.notifications,
      ],
    };
  });
}

// A demo purchase: the athlete set this price, so it is recorded here rather than through the catalog checkout.
export function buyDrop(campaignId: string) {
  setDemoState((state) => {
    const campaign = state.athleteCampaigns.find((item) => item.id === campaignId);
    const drop = campaign?.drop;
    if (!campaign || !drop || drop.sold >= drop.quantity) return state;
    const athlete = athletes.find((item) => item.id === campaign.athleteId);
    return {
      ...state,
      athleteCampaigns: state.athleteCampaigns.map((item) =>
        item.id === campaignId ? { ...item, drop: { ...drop, sold: drop.sold + 1 } } : item,
      ),
      sales: [
        {
          id: crypto.randomUUID(),
          productId: `drop:${campaign.id}`,
          athleteId: campaign.athleteId,
          amount: drop.price,
          athleteShare: athleteShare(drop.price),
          createdAt: new Date().toISOString(),
          title: `Sign and send: ${drop.item.toLowerCase()}`,
        },
        ...state.sales,
      ],
      notifications: [
        notification(`New order: ${drop.item} from ${athlete?.name}`, "/athlete/tasks"),
        ...state.notifications,
      ],
    };
  });
}
