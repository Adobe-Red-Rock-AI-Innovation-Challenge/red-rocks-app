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

// Deleting a chat also removes the files it generated; requests already sent stay.
export function deleteChats(ids: string[] | "all") {
  setDemoState((state) => ({
    ...state,
    aiChats: ids === "all" ? [] : state.aiChats.filter((chat) => !ids.includes(chat.id)),
  }));
}

// The assistant never prices athletes, so a business asks the athlete for a quote instead.
export function requestRate(sponsorName: string, athleteId: string, context: string) {
  const athlete = athletes.find((item) => item.id === athleteId);
  if (!athlete) return null;
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
  return offer.id;
}

// The built-in PDF fonts cover Latin-1 and common punctuation, so anything else is swapped for ASCII.
function pdfText(text: string) {
  return text
    .replace(/\*\*|__|`/g, "")
    .replace(/→/g, "->")
    .replace(/[^\x20-\x7E\xA0-\xFF“”‘’–—•…\n]/g, "");
}

// AI files are written in Markdown; the business downloads them as a simple PDF.
export async function downloadFile(file: AiFile) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const bottom = pdf.internal.pageSize.getHeight() - margin;
  let y = margin;

  for (const raw of file.content.split("\n")) {
    const heading = raw.match(/^(#{1,3})\s+(.*)/);
    const bullet = raw.match(/^\s*[-*•]\s+(.*)/);
    const size = heading ? [20, 15, 13][heading[1].length - 1] : 11;
    const text = pdfText(heading ? heading[2] : bullet ? `•  ${bullet[1]}` : raw);
    pdf.setFont("helvetica", heading ? "bold" : "normal").setFontSize(size);
    const lines: string[] = text.trim() ? pdf.splitTextToSize(text, bullet ? width - 12 : width) : [""];
    const lineHeight = size * 1.4;
    if (heading && y > margin) y += 6;
    for (const line of lines) {
      if (y + lineHeight > bottom) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, bullet ? margin + 12 : margin, y + size);
      y += line ? lineHeight : lineHeight / 2;
    }
  }
  pdf.save(`${file.name.replace(/\.(md|pdf)$/i, "")}.pdf`);
}
