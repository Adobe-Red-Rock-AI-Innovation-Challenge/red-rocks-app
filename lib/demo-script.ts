import { athletes } from "@/lib/data";

// Scripted demo conversations from the team's "NIL AI Assistant Demo Conversations" file. Each
// scenario answers in order no matter how the business words its replies, then attaches the
// matching proposal PDF. Anything outside a script falls back to the live assistant.

export type Scenario = {
  id: string;
  label: string;
  replies: string[];
  final: string;
  file: string;
  athleteIds: string[];
  // Suggested business lines, so a presenter can tap instead of type.
  businessLines: string[];
};

const PROPOSAL_NOTE =
  "This is a sample proposal for partner review, not an existing partnership. Athlete participation, image use, University channels and event access need athlete consent and University approval.";

export const scenarios: Record<string, Scenario> = {
  ford: {
    id: "ford",
    label: "Ford Mustang",
    replies: [
      "Yes. The Red Rocks’ precision and athletic performance could pair well with a Mustang campaign about control, confidence, and enjoying Utah’s scenery. To shape the idea around your goals, who do you most want to reach, and what action would you like them to take?",
      "That gives us a good starting point. Would you like the campaign to include local dealer activity and outdoor advertising, or should it focus mainly on social media and campus channels? Do you have a budget and preferred campaign length?",
    ],
    final:
      "I recommend the “Precision in Motion” campaign, with Utah’s scenic drives as a story angle. Avery Neff can lead the hero story, Camie Winger can represent controlled performance and Utah ties, and Sage Curtis can connect the campaign with students and meet-day fans. Their participation and image use would need their consent and University approval.\n\nThe attached proposal scopes a 10-week, $50,000 pilot with 10 original feed posts, four Story sequences, four Utah OOH placements, campus and Huntsman Center promotion, a dealer activation, and a test-drive path. The creative can connect the Mustang to scenic-trip inspiration around Zion, Bryce Canyon, and Monument Valley while keeping driving scenes safe and Ford-approved. The deck’s core idea is “Precision in Motion”; the named destinations are a suggested creative extension.",
    file: "Ford_Mustang_Red_Rocks_Campaign_Proposal.pdf",
    athleteIds: ["avery-neff", "camie-winger", "sage-curtis"],
    businessLines: [
      "We’re planning to promote the 2026 Ford Mustang to people in Utah. It’s a sports car, and we’d like to connect it with scenic drives to places such as Zion National Park, Bryce Canyon, and Monument Valley. Could the Utah Red Rocks Gymnastics team help us tell that story?",
      "We want to reach Utah residents, especially younger adults interested in cars, sports, and road trips. We want to build awareness and encourage people to explore the Mustang or schedule a test drive. We’re interested in using athlete content and University of Utah channels.",
      "We can invest $50,000 and run the campaign for about 10 weeks. We’re open to social media, campus promotion using athlete images, a dealer event, and a limited number of outdoor placements in Utah.",
    ],
  },
  diner: {
    id: "diner",
    label: "Ruth’s Diner",
    replies: [
      "A post-meet gathering could connect the Red Rocks’ team spirit with Ruth’s welcoming, historic setting. Which younger customers matter most to you, and what would you like them to do after seeing the campaign?",
      "That sounds like a focused campus campaign. Would you be comfortable using one athlete ambassador, a simple offer, and University-approved social or meet-day promotion? Also, what budget and meal or offer limit should the plan follow?",
    ],
    final:
      "I recommend “The Meet After the Meet,” a four-week campaign with Sage Curtis as the proposed campus-facing ambassador. Sage can invite students and fans to continue the day at Ruth’s through one short video, a Utah Gymnastics collaboration post, and two Story sequences. A small approved QR moment at one home meet can help people find the offer and help Ruth’s track responses. This plan uses no OOH placements, and total meal or offer costs stay at or below $150.\n\nThe attached proposal sets a $1,500 maximum budget, including at least $600 for Sage’s compensation and image-use rights, $300 for video capture and editing, $200 for campus digital creative and QR setup, $100 for a local social boost, up to $150 for the meal or offer, and $150 for tracking and contingency. The exact offer, participation, and campus access would need Ruth’s and University approval.",
    file: "Ruths_Diner_Red_Rocks_Campaign_Proposal.pdf",
    athleteIds: ["sage-curtis"],
    businessLines: [
      "Ruth’s Diner is a historic diner in a trolley car, with American food and a scenic canyon setting. We’re known as one of Utah’s oldest restaurants. We want more younger people to visit. Could the Red Rocks help us reach them in a way that feels connected to the team?",
      "We’d like to reach University of Utah students and younger Red Rocks fans. We want them to consider Ruth’s as a place to go after a home meet, try the restaurant, and bring friends. The idea should feel affordable and local.",
      "Yes. We can use one athlete and approved campus channels. Our maximum budget is $1,500, and we can spend no more than $150 on meals or the offer. We don’t have enough budget for OOH advertising.",
    ],
  },
  "budget-big": {
    id: "budget-big",
    label: "Ford Mustang (budget first)",
    replies: [
      "That budget can support a larger, multi-channel pilot. Before I recommend a mix, should the main outcome be awareness, test-drive interest, or both? Would you like the campaign to include University of Utah promotion and OOH in addition to social content?",
      "Understood. I’ll build around a 10-week pilot, three named athletes, a clear post count, four Utah OOH placements, campus promotion, and dealer tracking. The scenic-drive angle can be an added creative theme, with driving and destination details reviewed by Ford.",
    ],
    final:
      "Here is the budget-first plan. It allocates the $50,000 across athlete compensation and image-use rights ($20,000), content production ($9,000), paid social ($7,000), four OOH placements ($7,000), campus activation ($4,000), and measurement and contingency ($3,000).\n\nThe proposed plan features Avery Neff, Camie Winger, and Sage Curtis, subject to consent and University approval. It includes 10 original feed posts, four Story sequences, two campus OOH placements, two community or dealer-area OOH placements, an approved Huntsman Center feature, and a dealer activation. Ford can track reach and engagement, QR sessions, model-page visits, test-drive requests, and event attendance. The Zion, Bryce Canyon, and Monument Valley theme can guide the creative while the central idea remains “Precision in Motion.”",
    file: "Budget_Ford_Mustang_Red_Rocks_Campaign_Proposal.pdf",
    athleteIds: ["avery-neff", "camie-winger", "sage-curtis"],
    businessLines: [
      "We’re a big company with a $50,000 budget and want a campaign that runs for at least two months. We want to promote the 2026 Ford Mustang with the Utah Red Rocks Gymnastics team. How should we use the budget?",
      "Both awareness and test-drive interest. Please include athlete images on University-approved campus channels, a dealer activation, and a specific number of OOH placements in Utah. We also want scenic-drive content featuring Zion, Bryce Canyon, and Monument Valley.",
      "That works. Please show how the $50,000 is allocated and how Ford can measure whether the campaign worked.",
    ],
  },
  "budget-local": {
    id: "budget-local",
    label: "Ruth’s Diner (budget first)",
    replies: [
      "Yes. At that budget, I’d prioritize one athlete, a small set of social content, and a campus-facing activation rather than OOH. Is there a maximum amount for meals or the offer, and are you comfortable featuring one named athlete in the campaign?",
      "That keeps the plan focused. I recommend Sage Curtis as the proposed campus-facing ambassador, with a short video, a team collaboration post, two Story sequences, and a simple meet-day QR activation. I’ll reserve at least $600 for athlete compensation and image-use rights and keep the meal or offer spend within $150.",
    ],
    final:
      "Here is the budget-first plan. It sets a $1,500 maximum and allocates $600 to Sage’s proposed compensation and image-use rights, $300 to video capture and editing, $200 to campus digital creative and QR setup, $100 to a local social boost, up to $150 to the meal or offer, and $150 to tracking and contingency.\n\nThe four-week pilot includes two feed posts, two Story sequences, an approved Utah Gymnastics collaboration, and a small meet-day QR moment. It uses no OOH. Ruth’s can measure views and shares, QR scans, offer-page visits, and tracked redemptions or tagged checks. Athlete participation, image use, the offer, and campus access require approval.",
    file: "Budget_Ruths_Diner_Red_Rocks_Campaign_Proposal.pdf",
    athleteIds: ["sage-curtis"],
    businessLines: [
      "We’re Ruth’s Diner, a local restaurant. Our campaign budget is around $1,500, and we want to attract younger customers and University of Utah students. Can you suggest a Red Rocks Gymnastics campaign that fits this budget?",
      "We can spend no more than $150 on meals or the offer. We’re comfortable featuring one athlete, and we want the promotion to use the athlete’s image on approved University channels. We don’t want OOH placements.",
      "Please make the total no more than $1,500 and include the proposal PDF in your recommendation.",
    ],
  },
};

export { PROPOSAL_NOTE };

// A saved sample chat that opens instantly, so a live demo never waits on the AI.
export const sampleChat = {
  title: "Sego Smoothie, $3,000",
  ask: "We're Sego Smoothie Co. in Sugar House. We have $3,000 for a Red Rocks campaign that brings active students and families in for post-workout smoothies. What would you suggest?",
  answer:
    "I recommend “Fuel Like a Red Rock,” a four-week campaign that ties Sego's post-workout smoothies and acai bowls to the training behind every Red Rocks routine.\n\nBig idea: show what a Red Rock refuels with after practice, through athlete-made recipe content.\nKey message: Train hard, refuel local in Sugar House.\n\nProposed athletes:\n• Avery Neff, the team's all-arounder, for the hero Reel.\n• Elizabeth Gantner, whose profile lists cooking, for a “build your bowl” recipe post.\n• Camie Winger, whose profile lists hiking and biking, for an after-the-trail Story set.\n• Sage Curtis, a floor specialist, for a meet-week Story with the offer.\n\nPlanning split for $3,000 (a guide, not athlete prices): athlete compensation $2,000, content capture $400, local social boost $300, VIP Pass offer and QR setup $200, tracking and contingency $100. A “Red Rock Recharge” member offer uses personal codes, so Sego sees every redemption in store.\n\nAny single athlete deal of $600 or more goes through NIL Go, every post carries #ad, and pay is never tied to performance. Use Request rate on a card to get each athlete's own quote.",
  athleteIds: ["avery-neff", "elizabeth-gantner", "camie-winger", "sage-curtis"],
  file: {
    name: "Sego_Smoothie_Fuel_Like_a_Red_Rock_Plan",
    content: [
      "# Fuel Like a Red Rock",
      "Sego Smoothie Co. × Red Rocks Gymnastics · sample campaign plan",
      "",
      "## Big idea",
      "Show what a Red Rock refuels with after practice, through athlete-made recipe content. Key message: Train hard, refuel local in Sugar House.",
      "",
      "## Proposed athletes",
      "- Avery Neff: hero Reel",
      "- Elizabeth Gantner: “build your bowl” recipe post",
      "- Camie Winger: after-the-trail Story set",
      "- Sage Curtis: meet-week Story with the offer",
      "",
      "## Four-week plan",
      "- Week 1: hero Reel and the Red Rock Recharge offer for VIP Pass members",
      "- Week 2: recipe post and in-store QR at the Sugar House counter",
      "- Week 3: after-the-trail Story set",
      "- Week 4: meet-week Story and offer reminder",
      "",
      "## Planning split: $3,000",
      "- Athlete compensation: $2,000",
      "- Content capture: $400",
      "- Local social boost: $300",
      "- VIP Pass offer and QR setup: $200",
      "- Tracking and contingency: $100",
      "This split is a planning guide, not athlete prices. Each athlete quotes their own rate through Request rate.",
      "",
      "## How Sego measures results",
      "- Offer claims and in-store redemptions by personal code",
      "- Cost per redemption on the Results page",
      "- Reel and Story views and shares",
      "",
      "## Rules",
      "- Any single athlete deal of $600 or more goes through NIL Go",
      "- Every post carries #ad; no school marks without approval",
      "- Pay is never tied to performance",
      "",
      PROPOSAL_NOTE,
    ].join("\n"),
  },
};

export const openers = {
  athlete:
    "Which athlete would you like to work with? Type a name, or tell me you're not sure and I'll help you choose by personality.",
  campaign:
    "Tell me about your business and the product you want to promote. What story would you like the Red Rocks to help tell?",
  budget:
    "What budget are you working with, and are you a big company or a local business?",
};

// Opening chips mirror the script, so the demo can be clicked through.
export const openerChips = {
  athlete: ["Avery Neff", "I'm not sure yet"],
  campaign: [scenarios.ford.businessLines[0], scenarios.diner.businessLines[0]],
  budget: [scenarios["budget-big"].businessLines[0], scenarios["budget-local"].businessLines[0]],
};

export const PERSONALITY_TAGS = ["#energetic", "#fashion", "#music", "#gamer", "#outdoors", "#makeup", "#bookworm", "#creative", "#travel"];

export function pickScenario(mode: "campaign" | "budget", text: string) {
  const lower = text.toLowerCase();
  if (mode === "campaign") {
    if (/\b(ford|mustang)\b/.test(lower)) return scenarios.ford;
    if (/\b(diner|ruth)/.test(lower)) return scenarios.diner;
    return null;
  }
  if (/\b(big|large|ford|mustang|enterprise|national)\b/.test(lower)) return scenarios["budget-big"];
  if (/\b(local|small|diner|ruth)/.test(lower)) return scenarios["budget-local"];
  return null;
}

export function findAthlete(text: string) {
  const lower = text.toLowerCase();
  return athletes.filter(
    (athlete) => lower.includes(athlete.name.toLowerCase()) || lower.includes(athlete.name.split(" ")[0].toLowerCase()),
  );
}

export function undecided(text: string) {
  return /\b(not sure|unsure|don'?t know|help me (choose|pick|decide)|no idea|recommend|suggest|undecided|any)\b/i.test(text);
}

export function athletesWithTags(text: string) {
  const tags = PERSONALITY_TAGS.filter((tag) => text.toLowerCase().includes(tag.slice(1)));
  if (tags.length === 0) return { tags, matches: [] };
  return { tags, matches: athletes.filter((athlete) => athlete.personalityTags.some((tag) => tags.includes(tag))) };
}
