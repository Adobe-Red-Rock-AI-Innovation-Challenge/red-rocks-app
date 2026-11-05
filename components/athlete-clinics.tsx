"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { bookClinic, clinicTotal } from "@/lib/athlete-campaigns";
import { athletes } from "@/lib/data";
import { NIL_GO_THRESHOLD } from "@/lib/deals";

// Clinics athletes created and priced themselves, for Utah gym clubs and sponsors to book.
export function AthleteClinics() {
  const { state } = useDemo();
  const sponsorName = state.user?.organization ?? state.user?.name ?? "Your business";
  const clinics = state.athleteCampaigns.filter((campaign) => campaign.clinic);

  return (
    <div>
      <div className="grid gap-4">
        {clinics.length === 0 && <p className="text-sm text-muted-foreground">No clinics published yet.</p>}
        {clinics.map((campaign) => {
          const athlete = athletes.find((item) => item.id === campaign.athleteId);
          const clinic = campaign.clinic!;
          const total = clinicTotal(campaign);
          return (
            <article key={campaign.id} className="grid gap-4 rounded-2xl border p-5 sm:grid-cols-[4rem_1fr]">
              {athlete && (
                <Image src={athlete.image} alt="" width={64} height={64} className="size-16 rounded-full object-cover object-top" />
              )}
              <div>
                <p className="text-sm font-semibold text-primary">
                  {athlete?.name} · Youth clinic{campaign.sample && " · Sample"}
                </p>
                <h2 className="text-2xl">{campaign.title}</h2>
                <p className="mt-1 text-sm">{campaign.pitch}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {clinic.date} · {clinic.seats} spots × ${clinic.pricePerSeat} ={" "}
                  <span className="font-bold text-foreground">${total.toLocaleString("en-US")}</span>
                  {total >= NIL_GO_THRESHOLD && " · NIL Go clearance before the clinic"}
                </p>
                {clinic.bookedBy ? (
                  <p className="mt-3 text-sm font-semibold text-green-700">Booked by {clinic.bookedBy}</p>
                ) : (
                  <Button
                    className="mt-3"
                    onClick={() => {
                      bookClinic(campaign.id, sponsorName);
                      toast.success(`Clinic booked. ${athlete?.name.split(" ")[0]} has been notified.`);
                    }}
                  >
                    Book clinic
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        The athlete receives the full clinic price. Booking is simulated in this demo; no card is charged.
      </p>
    </div>
  );
}
