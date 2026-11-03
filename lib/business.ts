import { athletes } from "@/lib/data";
import { dealMessage, newOffer } from "@/lib/deals";
import { notification, setDemoState } from "@/lib/demo-store";
import type { AiChat, AiFile, DemoState } from "@/lib/types";

export function businessName(state: DemoState) {
  return state.businessProfile?.company || state.user?.organization || state.user?.name || "Your business";
}

export function saveChat(chat: AiChat) {
  setDemoState((state) => ({
    ...state,
    aiChats: [chat, ...state.aiChats.filter((item) => item.id !== chat.id)],
  }));
}

// The assistant never prices athletes, so a business asks the athlete for a quote instead.
export function requestRate(sponsorName: string, athleteId: string, context: string) {
  const athlete = athletes.find((item) => item.id === athleteId);
  if (!athlete) return;
  const first = athlete.name.split(" ")[0];
  const offer = {
    ...newOffer({
      sponsorName,
      athleteId,
      title: `Rate request from ${sponsorName}`,
      deliverables: context.trim().slice(0, 400) || "Open to ideas: social posts, an appearance or a fan offer.",
      price: 0,
      timeline: "To discuss",
      caption: "#ad",
    }),
    status: "inquiry" as const,
    messages: [
      dealMessage(
        "sponsor",
        `Hi ${first}, we'd love to work with you. Could you share your rate and availability for this?`,
      ),
    ],
  };
  setDemoState((state) => ({
    ...state,
    offers: [offer, ...state.offers],
    notifications: [notification(`${sponsorName} asked for your rate`, "/athlete/dashboard"), ...state.notifications],
  }));
}

export function downloadFile(file: AiFile) {
  const url = URL.createObjectURL(new Blob([file.content], { type: "text/markdown" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name.endsWith(".md") ? file.name : `${file.name}.md`;
  link.click();
  URL.revokeObjectURL(url);
}
