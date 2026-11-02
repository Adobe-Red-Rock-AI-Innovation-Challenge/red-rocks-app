"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { athletes } from "@/lib/data";
import { newOffer } from "@/lib/deals";
import { notification, setDemoState } from "@/lib/demo-store";
import type { Athlete } from "@/lib/types";

function compact(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

export default function SponsorAthletesPage() {
  const router = useRouter();
  const { state } = useDemo();
  const [hiring, setHiring] = useState<Athlete | null>(null);
  const sponsorName = state.user?.organization ?? state.user?.name ?? "Your business";
  const pendingApproval = state.user?.status === "pending";

  function hire(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hiring) return;
    const form = new FormData(event.currentTarget);
    const service = String(form.get("service"));
    const offer = newOffer({
      sponsorName,
      athleteId: hiring.id,
      title: `${service} for ${sponsorName}`,
      deliverables: `${service}. ${String(form.get("details")).trim()}`,
      price: Number(form.get("price")),
      timeline: `By ${form.get("date")}`,
      caption: `Teaming up with ${sponsorName}! #ad`,
    });

    setDemoState((current) => ({
      ...current,
      offers: [offer, ...current.offers],
      notifications: [
        notification(`New offer from ${sponsorName}`, "/athlete/dashboard"),
        ...current.notifications,
      ],
    }));
    setHiring(null);
    toast.success(`Offer sent to ${hiring.name}`);
    router.push("/sponsor/deals");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">Athletes</h1>
          <p className="mt-2 text-muted-foreground">Pick who you want to work with.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/sponsor" className={buttonVariants({ variant: "outline", size: "lg", className: "px-4" })}>
            <Sparkles />
            Let AI pick for me
          </Link>
          <Link href="/sponsor/requests" className={buttonVariants({ variant: "outline", size: "lg", className: "px-4" })}>
            Post a request instead
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {athletes.map((athlete) => {
          const from = Math.min(...athlete.rateCard.map((item) => item.price));
          return (
            <article key={athlete.id} className="flex flex-col overflow-hidden rounded-lg border">
              <Image
                src={athlete.image}
                alt=""
                width={400}
                height={400}
                unoptimized
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-2xl">{athlete.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {athlete.event} · {athlete.year}
                </p>
                <p className="mt-2 text-sm">
                  {compact(athlete.followers.instagram + athlete.followers.tiktok)} followers ·{" "}
                  {athlete.engagementRate}% engagement
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[...athlete.vibeTags, ...athlete.interestTags].map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 flex-1 text-sm font-semibold">From ${from.toLocaleString("en-US")}</p>
                <Button className="mt-3" disabled={pendingApproval} onClick={() => setHiring(athlete)}>
                  Hire {athlete.name.split(" ")[0]}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      {pendingApproval && (
        <p className="mt-4 text-sm text-muted-foreground">
          You can hire athletes once an admin approves your account.
        </p>
      )}

      <Dialog.Root open={hiring !== null} onOpenChange={(open) => !open && setHiring(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
            {hiring && (
              <>
                <Dialog.Title className="text-2xl">Hire {hiring.name}</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  {hiring.name} gets your offer and can accept, counter or decline.
                </Dialog.Description>
                <form key={hiring.id} onSubmit={hire} className="mt-4 grid gap-3">
                  <Field label="Service">
                    <Select
                      name="service"
                      onChange={(event) => {
                        const price = hiring.rateCard.find((item) => item.deliverable === event.target.value)?.price;
                        const priceInput = event.target.form?.elements.namedItem("price") as HTMLInputElement | null;
                        if (price && priceInput) priceInput.value = String(price);
                      }}
                    >
                      {hiring.rateCard.map((item) => (
                        <option key={item.deliverable} value={item.deliverable}>
                          {item.deliverable} (${item.price})
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Offer (USD)">
                      <Input name="price" type="number" min={50} required defaultValue={hiring.rateCard[0].price} />
                    </Field>
                    <Field label="Needed by">
                      <Input name="date" type="date" required />
                    </Field>
                  </div>
                  <Field label="What should they promote?">
                    <Textarea name="details" required maxLength={600} placeholder="Our new fall menu, 15% off for VIP Pass members." />
                  </Field>
                  <Button type="submit" size="lg">
                    Send offer
                  </Button>
                  <Dialog.Close render={<Button type="button" variant="ghost" size="lg" />}>Cancel</Dialog.Close>
                </form>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
