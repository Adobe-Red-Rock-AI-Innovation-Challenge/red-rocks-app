import { athletes } from "@/lib/data";
import type { RateCardItem } from "@/lib/types";

export type AiTasks = {
  polish: { input: { text: string; athleteName: string }; output: { text: string } };
  match: {
    input: { need: string; budget: number };
    output: { matches: { athleteId: string; score: number; reason: string }[] };
  };
  campaign: {
    input: { sponsorName: string; need: string; budget: number; athleteId: string };
    output: {
      title: string;
      deliverables: string;
      price: number;
      timeline: string;
      caption: string;
    };
  };
  bio: {
    input: { name: string; answers: string[] };
    output: { bios: string[]; tags: string[]; rateCard: RateCardItem[] };
  };
  tone: { input: { bio: string; tone: string }; output: { text: string } };
};

export type AiTask = keyof AiTasks;
export type AiInput<T extends AiTask> = AiTasks[T]["input"];
export type AiOutput<T extends AiTask> = AiTasks[T]["output"];
export type AiSource = "claude" | "demo";

function words(text: string) {
  return new Set(text.toLowerCase().match(/[a-z]{4,}/g) ?? []);
}

function ending(text: string) {
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}

// These run when ANTHROPIC_API_KEY is missing, so every AI button still works in a demo.
export const fallbacks: { [T in AiTask]: (input: AiInput<T>) => AiOutput<T> } = {
  polish: ({ text, athleteName }) => ({
    text: `Hi ${athleteName}! ${ending(text)} Thank you for inspiring us every meet.`,
  }),

  match: ({ need, budget }) => {
    const needWords = words(need);
    const matches = athletes.map((athlete) => {
      const profile = `${athlete.story} ${athlete.vibeTags.join(" ")} ${athlete.interestTags.join(" ")}`;
      const shared = [...words(profile)].filter((word) => needWords.has(word));
      const lowestPrice = Math.min(...athlete.rateCard.map((item) => item.price));
      const affordable = lowestPrice <= budget;
      const overlap = shared.length ? `Shares your focus on ${shared.slice(0, 3).join(", ")}. ` : "";
      return {
        athleteId: athlete.id,
        score: Math.min(
          98,
          55 + shared.length * 7 + (affordable ? 12 : 0) + Math.round(athlete.engagementRate),
        ),
        reason: `${overlap}${athlete.engagementRate}% engagement, and rates ${
          affordable ? "fit" : "stretch"
        } your budget.`,
      };
    });
    return { matches: matches.sort((a, b) => b.score - a.score).slice(0, 3) };
  },

  campaign: ({ sponsorName, need, budget, athleteId }) => {
    const athlete = athletes.find((item) => item.id === athleteId) ?? athletes[0];
    const affordable = athlete.rateCard.filter((item) => item.price <= budget).slice(0, 2);
    const items = affordable.length ? affordable : athlete.rateCard.slice(0, 1);
    return {
      title: `${sponsorName} x ${athlete.name}`,
      deliverables: `${items.map((item) => item.deliverable).join(" and ")}. Focus: ${ending(need)}`,
      price: items.reduce((sum, item) => sum + item.price, 0),
      timeline: "Week 1: brief. Week 2: film and review. Week 3: publish.",
      caption: `Proud to team up with ${sponsorName}. Come say hi! #ad`,
    };
  },

  bio: ({ name, answers }) => {
    const [story = "", motivation = "", causes = ""] = answers.map(ending);
    return {
      bios: [
        `${name} is a Red Rocks gymnast. ${story} ${motivation} Off the floor: ${causes}`,
        `Meet ${name}. ${motivation} ${story} What matters most: ${causes}`,
      ],
      tags: ["Energetic", "#CommunityFirst", "#StudentAthlete"],
      rateCard: [
        { deliverable: "Instagram post", price: 500 },
        { deliverable: "Instagram Reel", price: 750 },
        { deliverable: "In-person appearance (1 hr)", price: 1000 },
      ],
    };
  },

  tone: ({ bio, tone }) => {
    const openers: Record<string, string> = {
      Warmer: "With a whole lot of heart:",
      Bolder: "No limits.",
      Professional: "Profile summary:",
    };
    return { text: `${openers[tone] ?? ""} ${bio}`.trim() };
  },
};
