"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { athletes } from "@/lib/data";
import { newOffer } from "@/lib/deals";
import { notification, setDemoState } from "@/lib/demo-store";
import { SERVICE_FEE_PERCENT, sponsorPackages, type SponsorPackage } from "@/lib/packages";

export default function PackagesPage() {
  const router = useRouter();
  const { state } = useDemo();
  const sponsorName = state.user?.organization ?? state.user?.name ?? "Your business";
  const pendingApproval = state.user?.status === "pending";

  // Multi-athlete packages split the fee evenly, so every gymnast earns, not only the most followed.
  function start(item: SponsorPackage) {
    if (item.id === "spotlight") {
      router.push("/sponsor");
      return;
    }
    const roster = item.id === "meet-night" ? athletes.slice(0, 4) : athletes;
    const share = Math.round(item.price / roster.length);
    const offers = roster.map((athlete) =>
      newOffer({
        sponsorName,
        athleteId: athlete.id,
        packageId: item.id,
        title: `${item.name}: ${sponsorName}`,
        deliverables: `${item.includes[0]}. Promote a member-only offer from ${sponsorName}.`,
        price: share,
        timeline: item.id === "anchor" ? "Season long, monthly posts" : "Meet week",
        caption: `Meet week with ${sponsorName}! Show your VIP Pass for the deal. #ad`,
      }),
    );

    setDemoState((current) => ({
      ...current,
      offers: [...offers, ...current.offers],
      notifications: [
        notification(`${item.name} offers sent to ${roster.length} athletes`, "/business/requests"),
        ...current.notifications,
      ],
    }));
    toast.success(`Offers sent to ${roster.length} athletes`);
    router.push("/business/requests");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Sponsor packages</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Reach Red Rocks fans with a tracked offer. You see every redemption, so you know what
        your money brought in.
      </p>
      {pendingApproval && (
        <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
          Your account is waiting for admin approval. You can explore, but offers are sent after
          approval.
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {sponsorPackages.map((item) => (
          <section key={item.id} className="flex flex-col rounded-lg border p-5">
            <h2 className="text-2xl">{item.name}</h2>
            <p className="mt-1 font-heading text-4xl font-extrabold text-primary">
              ${item.price.toLocaleString("en-US")}
              {item.priceNote && <span className="text-base text-muted-foreground"> / {item.priceNote}</span>}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{item.bestFor}</p>
            <ul className="mt-4 grid flex-1 gap-2 text-sm">
              {item.includes.map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="mt-5"
              disabled={pendingApproval}
              onClick={() => start(item)}
            >
              {item.id === "spotlight" ? "Find my athlete" : `Start ${item.name}`}
            </Button>
          </section>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Athletes receive 100% of every package. A {SERVICE_FEE_PERCENT}% service fee is added on
        top to run the hub. Prices are planning
        estimates for this prototype.{" "}
        <Link href="/impact" className={buttonVariants({ variant: "link", className: "px-0" })}>
          See the revenue model
        </Link>
      </p>
    </div>
  );
}
