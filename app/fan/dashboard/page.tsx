"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { ChatThread } from "@/components/chat-thread";
import { useDemo } from "@/components/demo-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { VipCard } from "@/components/vip-card";
import { athletes, events, rewards, sponsors } from "@/lib/data";
import { isLive } from "@/lib/deals";
import { deleteFanData, setDemoState } from "@/lib/demo-store";
import type { Offer, ThankYou, VipEvent } from "@/lib/types";

function canAttend(event: VipEvent, membership: string) {
  return membership !== "duo" || event.tier === "Duo";
}

async function share(thanks: ThankYou) {
  const text = `${thanks.from}: "${thanks.message}" #RedRocksFanHub`;
  try {
    await navigator.share({ title: "Red Rocks Fan Hub", text });
    return;
  } catch (error) {
    if ((error as Error).name === "AbortError") return;
  }

  // Desktop browsers often lack a share sheet, so copying is the fallback.
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Could not share this message");
  }
}

// Each fan gets a personal code, so the sponsor's counter can count it once and spot reuse.
function claimCampaign(offer: Offer) {
  const code = `${offer.code}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  setDemoState((current) => ({
    ...current,
    fanCodes: { ...current.fanCodes, [offer.id]: code },
    offers: current.offers.map((item) =>
      item.id === offer.id ? { ...item, claims: item.claims + 1 } : item,
    ),
  }));
}

export default function FanDashboardPage() {
  const { state } = useDemo();
  const { fan, membership } = state;
  const campaigns = state.offers.filter((offer) => isLive(offer) && offer.status !== "reported");
  // The fan's own conversations, plus the sample so the demo shows a reply right away.
  const myChats = state.conversations.filter((chat) => chat.sample || chat.fanName === fan?.name);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl">My VIP Pass</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[24rem_1fr]">
        <div>
          {fan && membership ? (
            <VipCard user={fan} membership={membership} />
          ) : (
            <div className="rounded-lg border p-6 text-center">
              <p className="text-muted-foreground">Join to get your VIP Pass and rewards.</p>
              <Link
                href="/fan/join"
                className={buttonVariants({ size: "lg", className: "mt-4 px-4" })}
              >
                Join
              </Link>
            </div>
          )}

          <h2 className="mt-8 text-2xl">Messages</h2>
          <div className="mt-3 grid gap-2">
            {myChats.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Write to an athlete from their profile page.{" "}
                <Link href="/athletes" className="underline">
                  Find an athlete
                </Link>
              </p>
            )}
            {myChats.map((chat) => {
              const athlete = athletes.find((item) => item.id === chat.athleteId);
              const replied = chat.messages.at(-1)?.from === "athlete";
              return (
                <article key={chat.id} aria-label={`Messages with ${athlete?.name}`} className="rounded-lg border p-3">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    <Link href={`/athletes/${chat.athleteId}`} className="hover:text-primary">
                      {athlete?.name}
                    </Link>
                    {replied && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-white">Replied</span>}
                    {chat.sample && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-muted-foreground">
                        Sample conversation
                      </span>
                    )}
                  </p>
                  <div className="mt-2 max-h-56 overflow-y-auto">
                    <ChatThread
                      messages={chat.messages}
                      mine="fan"
                      names={{ fan: chat.sample ? chat.fanName : "You", athlete: athlete?.name ?? "Athlete" }}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <h2 className="mt-8 text-2xl">Thank-you inbox</h2>
          <div className="mt-3 grid gap-3">
            {state.thanks.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Back an athlete and their thank-you lands here.
              </p>
            )}
            {state.thanks.map((item) => (
              <article key={item.id} className="rounded-lg border p-4">
                <p className="font-semibold">{item.from}</p>
                <p className="mt-1 text-sm">{item.message}</p>
                <Button variant="outline" className="mt-3" onClick={() => share(item)}>
                  <Share2 />
                  Share
                </Button>
              </article>
            ))}
          </div>

          {fan && (
            <div className="mt-8 rounded-lg bg-neutral-50 p-4 text-sm">
              <p className="font-semibold">Your data</p>
              <p className="mt-1 text-muted-foreground">
                Saved for {fan.name} ({fan.email}).{" "}
                <Link href="/privacy" className="underline">
                  Privacy notice
                </Link>
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  if (!window.confirm("Delete your pass, rewards and messages?")) return;
                  deleteFanData();
                  toast.success("Your data was deleted");
                }}
              >
                Delete my data
              </Button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl">Sponsor rewards</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {campaigns.map((offer) => {
              const code = state.fanCodes[offer.id];
              const used = code !== undefined && offer.redeemedCodes.includes(code);
              return (
                <article key={offer.id} className="flex flex-col rounded-lg border p-4">
                  <p className="text-xs font-semibold text-primary">
                    {offer.sponsorName} · with {athletes.find((a) => a.id === offer.athleteId)?.name}
                  </p>
                  <p className="font-semibold">{offer.title}</p>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">
                    Member offer. Show your code at the counter.
                  </p>
                  {code ? (
                    <div className="mt-3 flex items-center gap-3 rounded bg-neutral-100 p-2">
                      <QRCodeSVG value={code} size={64} title={`Offer code ${code}`} />
                      <div className="min-w-0">
                        <p className="font-mono text-sm break-all">{code}</p>
                        <p className="text-xs text-muted-foreground">
                          {used ? "Used. Thanks!" : "Show this at the counter"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="mt-3"
                      disabled={!membership}
                      onClick={() => claimCampaign(offer)}
                    >
                      Claim
                    </Button>
                  )}
                </article>
              );
            })}
            {rewards.map((reward) => {
              const claimed = state.claimedRewards.includes(reward.id);
              const sponsor = sponsors.find((item) => item.id === reward.sponsorId);
              return (
                <article key={reward.id} className="flex flex-col rounded-lg border p-4">
                  <p className="text-xs font-semibold text-primary">{sponsor?.name}</p>
                  <p className="font-semibold">{reward.title}</p>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{reward.description}</p>
                  {claimed ? (
                    <p className="mt-3 rounded bg-neutral-100 px-2 py-1.5 text-center font-mono text-sm">
                      {reward.code}
                    </p>
                  ) : (
                    <Button
                      className="mt-3"
                      disabled={!membership}
                      onClick={() =>
                        setDemoState((current) => ({
                          ...current,
                          claimedRewards: [...current.claimedRewards, reward.id],
                        }))
                      }
                    >
                      Claim
                    </Button>
                  )}
                </article>
              );
            })}
          </div>

          <h2 className="mt-8 text-2xl">VIP events</h2>
          <div className="mt-3 grid gap-3">
            {events.map((event) => {
              const going = state.rsvps.includes(event.id);
              const allowed = membership !== null && canAttend(event, membership);
              return (
                <article
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date} · {event.location} · {event.tier === "Duo" ? "Insider" : "All-Access"} tier
                    </p>
                  </div>
                  <Button
                    variant={going ? "outline" : "default"}
                    disabled={!allowed}
                    onClick={() =>
                      setDemoState((current) => ({
                        ...current,
                        rsvps: going
                          ? current.rsvps.filter((id) => id !== event.id)
                          : [...current.rsvps, event.id],
                      }))
                    }
                  >
                    {going ? "Going ✓" : "RSVP"}
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
