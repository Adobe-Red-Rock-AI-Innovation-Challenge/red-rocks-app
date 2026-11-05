import { AthleteClinics } from "@/components/athlete-clinics";

// Packages shows the same clinics; this address stays for links already shared.
export default function SponsorOpportunitiesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Opportunities from athletes</h1>
      <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
        Youth clinics Red Rocks athletes pitched and priced themselves. Book one for your gym club,
        your customers or your team.
      </p>
      <AthleteClinics />
    </div>
  );
}
