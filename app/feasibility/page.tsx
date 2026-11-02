const phases = [
  {
    name: "Phase 1: Pilot",
    when: "One season",
    items: [
      "5 to 10 local sponsors and the full roster",
      "Stripe test mode, then live payments after review",
      "Manual NIL Go submission by each athlete",
    ],
  },
  {
    name: "Phase 2: Launch",
    when: "Second season",
    items: [
      "Open sponsor sign-up with admin approval",
      "Results reports sent to sponsors every month",
      "Adobe Express templates for every campaign",
    ],
  },
  {
    name: "Phase 3: Scale",
    when: "Year three",
    items: [
      "Add more Utah women's sports",
      "Alumni gymnasts as mentors and paid creators",
      "Repeat-sponsor discounts and season renewals",
    ],
  },
];

const operators = [
  ["Athletics marketing (1 part-time staff)", "Sells packages and approves sponsors"],
  ["NIL and compliance office", "Reviews deals and NIL Go clearances"],
  ["Student creative team", "Makes Adobe Express content with athletes"],
  ["Web support (part-time)", "Keeps the app running"],
];

const costs = [
  ["Hosting (Vercel Pro)", "About $20 a month per team member"],
  ["Database (Neon or similar)", "Free tier to start"],
  ["Payments (Stripe)", "Per transaction; check Stripe's current pricing"],
  ["AI (Claude API)", "Usage based; cap it with a monthly spending limit"],
  ["Adobe Express", "Through the University's software program"],
];

const risks = [
  ["NIL Go may not clear a deal", "Build clearance time into every campaign and price within each athlete's range"],
  ["A school-run platform gets closer review", "Have the NIL office approve the operating model before launch"],
  ["Sponsors do not renew", "Show cost per redemption so the value is visible"],
  ["Fan privacy", "Collect only name and email; never store cards"],
];

function Table({ rows, head }: { rows: string[][]; head: [string, string] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[30rem] text-sm">
        <thead className="text-left text-xs text-muted-foreground uppercase">
          <tr>
            <th className="p-3">{head[0]}</th>
            <th className="p-3">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([first, second]) => (
            <tr key={first} className="border-t">
              <td className="p-3 font-semibold">{first}</td>
              <td className="p-3 text-muted-foreground">{second}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FeasibilityPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Business plan</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Who runs the hub, what it costs and how it grows. Costs are planning estimates.
      </p>

      <h2 className="mt-10 text-3xl">Roadmap</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {phases.map((phase) => (
          <section key={phase.name} className="rounded-lg border p-5">
            <h3 className="text-xl text-primary">{phase.name}</h3>
            <p className="text-sm text-muted-foreground">{phase.when}</p>
            <ul className="mt-3 grid list-disc gap-1 pl-5 text-sm">
              {phase.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-3xl">Who runs it</h2>
          <Table rows={operators} head={["Team", "Job"]} />
        </section>
        <section>
          <h2 className="text-3xl">What it costs</h2>
          <Table rows={costs} head={["Item", "Estimate"]} />
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-3xl">Risks</h2>
        <Table rows={risks} head={["Risk", "How we handle it"]} />
      </section>
    </div>
  );
}
