const sections = [
  {
    title: "What we collect",
    items: [
      "Fans: your name and email, only when you pay. Your name goes on your VIP Pass; your email gets your receipt.",
      "Sponsors and athletes: the name, email and photo from your Google account.",
      "What you do in the app: memberships, rewards you claim, events you RSVP to and deals.",
    ],
  },
  {
    title: "What we never collect",
    items: [
      "Card numbers. Payments run on Stripe's secure page, and card details never reach this app.",
      "Passwords. Partners sign in with Google.",
    ],
  },
  {
    title: "How we use it",
    items: [
      "To show your pass, rewards and deals, and to send receipts.",
      "Sponsors see how many people redeemed an offer, never who they are.",
      "We do not sell personal data or use it for advertising.",
    ],
  },
  {
    title: "Your choices",
    items: [
      "Delete your fan data anytime from My Pass with Delete my data.",
      "Partners can ask a team admin to remove their account.",
      "Fans under 13 should not sign up. Fans under 18 need a parent's permission.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl">Privacy notice</h1>
      <p className="mt-2 text-muted-foreground">
        We collect as little as possible and keep it only as long as you use the hub.
      </p>
      {sections.map((section) => (
        <section key={section.title} className="mt-8">
          <h2 className="text-2xl">{section.title}</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-5">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-10 rounded-lg bg-neutral-50 p-4 text-sm text-muted-foreground">
        Prototype status: in this demo, fan data stays in your own browser. Before launch, the
        University&apos;s privacy and compliance offices must review this notice.
      </p>
    </div>
  );
}
