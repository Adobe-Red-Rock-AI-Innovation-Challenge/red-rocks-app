import { athletes, events, quests, rewards, sponsors } from "@/lib/data";

const seedCounts = [
  { label: "Athletes", count: athletes.length },
  { label: "Sponsors", count: sponsors.length },
  { label: "Fan quests", count: quests.length },
  { label: "VIP events", count: events.length },
  { label: "Sponsor rewards", count: rewards.length },
];

// Temporary home for step 1: the real landing page replaces this in step 2.
export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <p className="text-sm font-semibold text-primary">Step 1: foundation</p>
      <h1 className="mt-1 max-w-2xl text-5xl">Seed data loaded</h1>
      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {seedCounts.map((item) => (
          <div key={item.label} className="rounded-lg border p-4">
            <dd className="font-heading text-4xl font-extrabold text-primary">{item.count}</dd>
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
