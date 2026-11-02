const steps = [
  {
    title: "Fans",
    items: [
      "Join with a monthly plan or give once.",
      "Show your VIP Pass, claim sponsor rewards and RSVP to events.",
      "Back an athlete's Quest and get a thank-you in your inbox.",
    ],
  },
  {
    title: "Sponsors",
    items: [
      "Describe what you need and your budget.",
      "AI picks your top three athletes and explains why.",
      "Generate a campaign draft, then send the offer.",
    ],
  },
  {
    title: "Athletes",
    items: [
      "Answer a few questions and AI drafts your bio, tags and rates.",
      "Accept, negotiate or decline offers in your inbox.",
      "Check every offer against the NIL traffic-light checks first.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl">How it works</h1>
      <p className="mt-2 text-muted-foreground">
        One hub connects fans, sponsors and athletes. Use the &quot;Demo as&quot; bar to try each
        side.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <section key={step.title} className="rounded-lg border p-5">
            <h2 className="text-2xl text-primary">{step.title}</h2>
            <ol className="mt-3 grid list-decimal gap-2 pl-5 text-sm">
              {step.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
