import athletesJson from "@/data/athletes.json";
import eventsJson from "@/data/events.json";
import impactJson from "@/data/impact.json";
import questsJson from "@/data/quests.json";
import rewardsJson from "@/data/rewards.json";
import sponsorsJson from "@/data/sponsors.json";
import type {
  Athlete,
  ImpactBaseline,
  Quest,
  Reward,
  Sponsor,
  VipEvent,
} from "@/lib/types";

export const athletes: Athlete[] = athletesJson;
export const sponsors: Sponsor[] = sponsorsJson;
export const quests: Quest[] = questsJson;
export const events = eventsJson as VipEvent[];
export const rewards: Reward[] = rewardsJson;
export const impactBaseline: ImpactBaseline = impactJson;
