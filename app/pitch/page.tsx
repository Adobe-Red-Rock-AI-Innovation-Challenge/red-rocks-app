import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// A presenter's checklist: one sponsor journey from first question to money, in demo order.
const steps = [
  {
    title: "The opportunity",
    say: "12,207 fans per meet and 800K followers, yet local businesses can't measure what a sponsorship brings.",
    proves: "NIL Funding Impact",
    links: [{ href: "/", label: "Home page" }],
    how: "Scroll from the hero to the WRTH numbers and the budget dial.",
  },
  {
    title: "A business asks the AI",
    say: "Ruth's Diner has $1,500. The assistant asks the right questions and returns a full proposal.",
    proves: "AI & Innovation, Sponsor Engagement",
    links: [{ href: "/login", label: "Sign in as Demo sponsor" }],
    how: "Start with a budget → tap the Ruth's Diner reply → tap the next two replies → open the PDF.",
  },
  {
    title: "Request a rate",
    say: "The AI never guesses an athlete's price. The business asks Sage directly.",
    proves: "Athlete & Sponsor Engagement",
    links: [{ href: "/business/requests", label: "Business Hub → Requests" }],
    how: "Tap Request rate on Sage's card, then View the request.",
  },
  {
    title: "The athlete quotes",
    say: "Sage sets her own price and terms, with an automatic NIL check.",
    proves: "Athlete profiles, compliance",
    links: [{ href: "/athlete/dashboard", label: "Athlete deals" }],
    how: "Switch Demo as → Athlete, pick Sage Curtis, send a $600 quote.",
  },
  {
    title: "Accept and run the project",
    say: "Accepting turns the deal into a project with tasks, dates and approvals.",
    proves: "Platform & MVP",
    links: [{ href: "/business/projects", label: "Business Hub → Projects" }],
    how: "Switch back to Sponsor, accept in Requests, open Projects.",
  },
  {
    title: "Fans redeem the offer",
    say: "A fan joins for $10, claims the offer and shows the QR code at the counter.",
    proves: "NIL Funding Impact",
    links: [
      { href: "/fan/join", label: "Fan join" },
      { href: "/sponsor/redeem", label: "Counter redeem" },
    ],
    how: "Join as a fan, claim on My Pass, then enter the code on Redeem.",
  },
  {
    title: "Proof and renewal",
    say: "The business sees cost per visit, and every fan dollar reaches athletes.",
    proves: "NIL Funding Impact, Business Feasibility",
    links: [
      { href: "/sponsor/results", label: "Results" },
      { href: "/impact", label: "WRTH money flow" },
      { href: "/feasibility", label: "Business plan" },
    ],
    how: "Show Results, then the money flow and who runs the hub.",
  },
];

export default function PitchPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Pitch guide</h1>
      <p className="mt-2 text-muted-foreground">
        One sponsor journey, from the first question to money in athletes&apos; hands. Use Reset in
        the top bar before you start.
      </p>

      <ol className="mt-8 grid gap-4">
        {steps.map((step, index) => (
          <li key={step.title} className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-[3rem_1fr]">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-white">
              {index + 1}
            </span>
            <div>
              <h2 className="text-xl">{step.title}</h2>
              <p className="mt-1">&ldquo;{step.say}&rdquo;</p>
              <p className="mt-2 text-sm text-muted-foreground">{step.how}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {step.links.map((link) => (
                  <Link key={link.href} href={link.href} className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-sm text-white">
                    {link.label} <ArrowUpRight className="size-3.5" />
                  </Link>
                ))}
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-primary">Proves: {step.proves}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
