"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AiSource } from "@/components/ai-source";
import { AthletePicker } from "@/components/athlete-picker";
import { useDemo } from "@/components/demo-provider";
import { NilCheckTable } from "@/components/nil-check-table";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import type { AiSource as Source } from "@/lib/ai";
import { askAi } from "@/lib/ai-client";
import { CLINIC_TARGET, DROP_ITEMS, DROP_SUGGESTED_PRICE, publishCampaign } from "@/lib/athlete-campaigns";
import { athletes } from "@/lib/data";
import { ATHLETE_SHARE_PERCENT, athleteShare } from "@/lib/gifts";
import { checkCampaign, worstStatus } from "@/lib/nil";
import type { AthleteCampaignKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const templates: { kind: AthleteCampaignKind; title: string; text: string }[] = [
  { kind: "clinic", title: "Youth clinic", text: "Utah gym clubs and sponsors book it." },
  { kind: "drop", title: "Signed drop", text: "Fans buy it on Gifts." },
];

function whole(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { state } = useDemo();
  const athlete = athletes.find((item) => item.id === state.activeAthleteId) ?? athletes[0];
  const first = athlete.name.split(" ")[0];

  const [kind, setKind] = useState<AthleteCampaignKind>("clinic");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-12-20");
  const [seats, setSeats] = useState(20);
  const [pricePerSeat, setPricePerSeat] = useState(250);
  const [item, setItem] = useState(DROP_ITEMS[0]);
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(DROP_SUGGESTED_PRICE);
  const [pitch, setPitch] = useState("");
  const [source, setSource] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);

  const name = title.trim() || (kind === "clinic" ? `Youth clinic with ${first}` : item);
  const clinicTotal = whole(seats) * whole(pricePerSeat);
  // A club books the whole clinic, so it is one payer; each drop buyer pays the item price.
  const checks = checkCampaign(`${name} ${pitch}`, kind === "clinic" ? clinicTotal : whole(price));
  const blocked = worstStatus(checks) === "red";
  const ready = pitch.trim().length > 0 && (kind === "clinic" ? clinicTotal > 0 && date : whole(price) > 0 && whole(quantity) > 0);

  async function writePitch() {
    setBusy(true);
    try {
      const details =
        kind === "clinic"
          ? `${name} on ${date}, ${whole(seats)} spots.`
          : `${item}, ${whole(quantity)} available at $${whole(price)} each.`;
      const { data, source: from } = await askAi("pitch", { athleteId: athlete.id, kind, details });
      setPitch(data.text);
      setSource(from);
    } catch {
      toast.error("Could not write a pitch. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function publish(event: FormEvent) {
    event.preventDefault();
    if (blocked || !ready) return;
    publishCampaign({
      id: crypto.randomUUID(),
      athleteId: athlete.id,
      kind,
      title: name,
      pitch: pitch.trim(),
      createdAt: new Date().toISOString(),
      ...(kind === "clinic"
        ? { clinic: { date, seats: whole(seats), pricePerSeat: whole(pricePerSeat) } }
        : { drop: { item, quantity: whole(quantity), price: whole(price), sold: 0 } }),
    });
    toast.success(kind === "clinic" ? "Clinic published for clubs and sponsors" : "Drop is live on Gifts");
    router.push("/athlete/opportunities");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Create campaign</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Pitch your own campaign and set your own price. The NIL check runs before you publish.
      </p>
      <AthletePicker />

      <form onSubmit={publish} className="mt-6 grid gap-6">
        <div role="radiogroup" aria-label="Template" className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.kind}
              type="button"
              role="radio"
              aria-checked={kind === template.kind}
              onClick={() => {
                setKind(template.kind);
                setPitch("");
                setSource(null);
              }}
              className={cn(
                "rounded-2xl border p-4 text-left",
                kind === template.kind ? "border-primary ring-1 ring-primary" : "hover:border-primary",
              )}
            >
              <p className="font-extrabold">{template.title}</p>
              <p className="text-sm text-muted-foreground">{template.text}</p>
            </button>
          ))}
        </div>

        {kind === "clinic" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Clinic name">
              <Input value={title} maxLength={80} placeholder={name} onChange={(event) => setTitle(event.target.value)} />
            </Field>
            <Field label="Date">
              <Input type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
            </Field>
            <Field label="Spots">
              <Input type="number" min={1} max={200} value={seats} onChange={(event) => setSeats(event.target.valueAsNumber)} />
            </Field>
            <Field label="Price per spot (USD)">
              <Input type="number" min={1} value={pricePerSeat} onChange={(event) => setPricePerSeat(event.target.valueAsNumber)} />
            </Field>
            <p className="text-sm sm:col-span-2">
              Total: <span className="font-bold">${clinicTotal.toLocaleString("en-US")}</span>
              <span className="text-muted-foreground">
                {" "}· Suggested about ${CLINIC_TARGET.toLocaleString("en-US")} per clinic, for example 20 spots × $250.
              </span>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Item">
              <Select value={item} onChange={(event) => setItem(event.target.value)}>
                {DROP_ITEMS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </Field>
            <Field label="Quantity">
              <Input type="number" min={1} max={1000} value={quantity} onChange={(event) => setQuantity(event.target.valueAsNumber)} />
            </Field>
            <Field label="Price (USD)">
              <Input type="number" min={1} value={price} onChange={(event) => setPrice(event.target.valueAsNumber)} />
            </Field>
            <p className="text-sm text-muted-foreground sm:col-span-3">
              Suggested ${DROP_SUGGESTED_PRICE}. {ATHLETE_SHARE_PERCENT}% goes to you: ${athleteShare(whole(price)).toFixed(2)} per sale.
            </p>
          </div>
        )}

        <div className="grid gap-2">
          <Field label="Pitch">
            <Textarea
              value={pitch}
              maxLength={500}
              placeholder="Write a short pitch, or let AI draft one from your profile. Edit it before you publish."
              onChange={(event) => setPitch(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" disabled={busy} onClick={writePitch}>
              ✨ {busy ? "Writing..." : "Write pitch with AI"}
            </Button>
            {source && <AiSource source={source} />}
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <NilCheckTable checks={checks} />
          <p className="mt-2 text-xs text-muted-foreground">
            A screening aid, not legal advice. Blocked campaigns can&apos;t be published.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={blocked || !ready}>
          {blocked ? "Fix the blocked checks to publish" : "Publish"}
        </Button>
      </form>
    </div>
  );
}
