import { athletes } from "@/lib/data";
import { notification, setDemoState } from "@/lib/demo-store";
import type { LivePlatform } from "@/lib/types";

export const LIVE_PLATFORMS: { platform: LivePlatform; host: RegExp; example: string }[] = [
  { platform: "TikTok", host: /(^|\.)tiktok\.com$/, example: "https://www.tiktok.com/@yourname/live" },
  { platform: "Instagram", host: /(^|\.)instagram\.com$/, example: "https://www.instagram.com/yourname/live" },
];

// Only an https link on the chosen platform goes out to fans.
export function liveLinkProblem(platform: LivePlatform, url: string) {
  try {
    const parsed = new URL(url.trim());
    const rule = LIVE_PLATFORMS.find((item) => item.platform === platform);
    if (parsed.protocol !== "https:" || !rule?.host.test(parsed.hostname)) {
      return `Paste your ${platform} live link (it starts with https:// and is on ${platform}).`;
    }
    return null;
  } catch {
    return `Paste your ${platform} live link.`;
  }
}

export function goLive(athleteId: string, platform: LivePlatform, url: string) {
  const name = athletes.find((item) => item.id === athleteId)?.name ?? "An athlete";
  setDemoState((state) => ({
    ...state,
    live: [
      { athleteId, platform, url: url.trim(), startedAt: new Date().toISOString() },
      ...state.live.filter((item) => item.athleteId !== athleteId),
    ],
    notifications: [notification(`${name} is live on ${platform}`, "/athletes"), ...state.notifications],
  }));
}

export function endLive(athleteId: string) {
  setDemoState((state) => ({ ...state, live: state.live.filter((item) => item.athleteId !== athleteId) }));
}
