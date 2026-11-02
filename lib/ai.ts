import { athletes } from "@/lib/data";
import type { CampaignPlan, RateCardItem } from "@/lib/types";

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
  plan: { input: PlanInput; output: CampaignPlan };
  refine: { input: { plan: CampaignPlan; instruction: string }; output: CampaignPlan };
  reply: { input: { athleteName: string; fanName: string; message: string }; output: { text: string } };
};

export type PlanInput = {
  sponsorName: string;
  product: string;
  goal: string;
  audience: string;
  budget: number;
  startMonth: number;
  monthCount: number;
  athleteIds: string[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Only these facts may be presented as true; everything else in a plan is an assumption.
export const PLAN_FACTS = [
  "Red Rocks home meets averaged 12,207 fans in 2025 (Salt Lake Tribune).",
  "The Huntsman Center seats about 15,000; the NCAA record crowd is 16,019 (Utah Athletics).",
  "Utah led the nation in gymnastics attendance in 36 of 39 seasons (Utah Athletics).",
  "Third-party NIL deals of $600 or more must be submitted to NIL Go before work starts (College Sports Commission).",
];

function planMonths(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => MONTHS[(start + index) % 12]);
}

function round(value: number) {
  return Math.round(value / 50) * 50;
}

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
      const profile = `${athlete.story} ${athlete.event} ${athlete.hometown} ${athlete.interestTags.join(" ")}`;
      const shared = [...words(profile)].filter((word) => needWords.has(word));
      const lowestPrice = Math.min(...athlete.rateCard.map((item) => item.price));
      const affordable = lowestPrice <= budget;
      const overlap = shared.length ? `Shares your focus on ${shared.slice(0, 3).join(", ")}. ` : "";
      return {
        athleteId: athlete.id,
        score: Math.min(
          98,
          55 + shared.length * 7 + (affordable ? 12 : 0) + Object.keys(athlete.careerHighs).length * 2,
        ),
        reason: `${overlap}${athlete.event}, ${athlete.year.toLowerCase()} from ${athlete.hometown}; rates ${
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

  plan: (input) => {
    const count = Math.min(6, Math.max(2, Math.round(input.monthCount)));
    const months = planMonths(input.startMonth, count);
    const chosen = athletes.filter((athlete) => input.athleteIds.includes(athlete.id));
    const team = chosen.length ? chosen : athletes.slice(0, 3);
    const names = team.map((athlete) => athlete.name.split(" ")[0]).join(", ");
    const last = count - 1;
    const middle = Math.floor(last / 2);
    const firstEnd = Math.max(0, middle - (count > 3 ? 1 : 0));

    return {
      bigIdea: `${input.product} for the Red Rocks family: cheer with ${names}, then come in with your VIP Pass.`,
      months,
      phases: [
        { name: "Awareness", start: 0, end: firstEnd, keyHook: `${names} ${team.length === 1 ? "introduces" : "introduce"} ${input.product}` },
        { name: "Engagement", start: Math.min(firstEnd + 1, last), end: Math.max(middle, Math.min(firstEnd + 1, last)), keyHook: "Fan challenge at a home meet" },
        { name: "Conversion", start: Math.min(middle + 1, last), end: last, keyHook: "VIP Pass member offer with a tracked code" },
      ],
      rows: [
        {
          channel: "Athlete posts",
          group: "Athletes",
          items: [
            { start: 0, end: firstEnd, text: `Intro Reels: ${names} try ${input.product}` },
            { start: Math.min(middle + 1, last), end: last, text: "Story reminders with the offer code" },
          ],
        },
        {
          channel: "Fan community",
          group: "Fans",
          items: [
            { start: Math.min(firstEnd + 1, last), end: middle, text: "Fan challenge: post your Red Rocks pose" },
            { start: Math.min(middle + 1, last), end: last, text: "Member-only offer in the VIP Pass" },
          ],
        },
        {
          channel: "Meet day",
          group: "In person",
          items: [{ start: middle, end: middle, text: "Meet-night table and sampling outside the arena" }],
        },
        {
          channel: "PR",
          group: "PR",
          items: [
            { start: 0, end: 0, text: "Launch announcement" },
            { start: last, end: last, text: "Results recap with redemptions" },
          ],
        },
      ],
      research: {
        audienceInsight: `${input.audience || "Red Rocks fans"} already show up in person, so an in-store offer can be measured by redemptions, not impressions.`,
        whyTheseAthletes: team
          .map((athlete) => `${athlete.name}: ${athlete.year.toLowerCase()} from ${athlete.hometown}${athlete.event !== "Red Rocks gymnast" ? `, ${athlete.event}` : ""}.`)
          .join(" "),
        facts: PLAN_FACTS,
        assumptions: [
          "2% to 4% of members who see the offer redeem it.",
          `A target of about $15 per redemption on a $${input.budget.toLocaleString("en-US")} budget.`,
        ],
        risks: [
          "Each athlete deal of $600 or more needs NIL Go clearance first.",
          "No school logos or uniforms without approval; every post carries #ad.",
        ],
      },
      budget: [
        { item: `Athlete fees (${team.length})`, amount: round(input.budget * 0.7) },
        { item: "Content and Adobe Express creative", amount: round(input.budget * 0.15) },
        { item: "Fan offer and meet-day table", amount: round(input.budget * 0.15) },
      ],
      kpis: [
        { metric: "Redemptions", target: `${Math.max(20, Math.round(input.budget / 15))}` },
        { metric: "Cost per redemption", target: "$15 or less" },
        { metric: "Athlete posts", target: `${team.length * 3}` },
      ],
    };
  },

  refine: ({ plan, instruction }) => {
    const text = instruction.toLowerCase();
    let next = structuredClone(plan);
    if (/cheap|budget|cost|less money/.test(text)) {
      next.budget = next.budget.map((line) => ({ ...line, amount: round(line.amount * 0.7) }));
    }
    const shorter = /(\d)\s*month/.exec(text);
    if (shorter || /short/.test(text)) {
      const keep = Math.max(2, Math.min(next.months.length - 1, shorter ? Number(shorter[1]) : next.months.length - 1));
      const clamp = (value: number) => Math.min(value, keep - 1);
      next = {
        ...next,
        months: next.months.slice(0, keep),
        phases: next.phases.map((phase) => ({ ...phase, start: clamp(phase.start), end: clamp(phase.end) })),
        rows: next.rows.map((row) => ({
          ...row,
          items: row.items.map((item) => ({ ...item, start: clamp(item.start), end: clamp(item.end) })),
        })),
      };
    }
    if (/fan|engage/.test(text)) {
      next.rows = next.rows.map((row) =>
        row.group === "Fans"
          ? { ...row, items: [...row.items, { start: 0, end: 0, text: "Athlete Q&A for VIP members" }] }
          : row,
      );
    }
    next.research.assumptions = [...next.research.assumptions, `Refined for: "${instruction}"`];
    return next;
  },

  reply: ({ athleteName, fanName, message }) => ({
    text: `Hi ${fanName.split(" ")[0]}! Thank you so much for your message${
      /\?/.test(message) ? ". Great question: keep practicing the basics and have fun with it" : ""
    }. See you at the next meet! – ${athleteName.split(" ")[0]}`,
  }),
};
