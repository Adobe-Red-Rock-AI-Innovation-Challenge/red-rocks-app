import Image from "next/image";
import Link from "next/link";
import { SeasonGoal } from "@/components/season-goal";
import { buttonVariants } from "@/components/ui/button";

// Set this to a file in /public (e.g. "/media/hero.mp4") to use an Adobe Express video instead.
const HERO_VIDEO: string | null = null;
const HERO_IMAGE = "/images/hero.svg";

const proof = [
  { value: "10", label: "National titles" },
  { value: "12,207", label: "Fans per meet, 2025 average" },
  { value: "16,019", label: "NCAA record crowd, 2015" },
];

const audiences = [
  {
    title: "Sponsors",
    text: "Reach one of the most loyal crowds in college sports with a tracked offer, and see every redemption.",
    href: "/sponsor/packages",
    cta: "See packages",
  },
  {
    title: "Athletes",
    text: "Get matched with local brands, check every offer against NIL rules and get paid in one place.",
    href: "/athlete/dashboard",
    cta: "Athlete sign in",
  },
  {
    title: "Fans",
    text: "Get a VIP Pass with sponsor rewards and back the gymnasts you love. No account needed.",
    href: "/fan/join",
    cta: "Join the community",
  },
];

const steps = [
  "A sponsor picks a package and AI finds the right athletes.",
  "Athletes accept, clear the deal with NIL Go and post.",
  "Fans redeem the offer with their VIP Pass.",
  "The sponsor sees results and books again.",
];

export default function Home() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <p className="font-semibold text-primary">Red Rocks NIL Hub</p>
          <h1 className="mt-1 text-5xl sm:text-6xl">Turn Red Rocks fans into NIL dollars</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            One place where local businesses sponsor every gymnast, fans redeem the offers and
            everyone sees what it earned.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/sponsor/packages"
              className={buttonVariants({ size: "lg", className: "px-5" })}
            >
              Become a sponsor
            </Link>
            <Link
              href="/athletes"
              className={buttonVariants({ variant: "outline", size: "lg", className: "px-5" })}
            >
              Explore Athletes
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-neutral-950">
          {HERO_VIDEO ? (
            <video
              src={HERO_VIDEO}
              poster={HERO_IMAGE}
              controls
              playsInline
              className="aspect-video w-full object-cover"
            />
          ) : (
            <Image
              src={HERO_IMAGE}
              alt="Red Rocks hero artwork"
              width={1600}
              height={900}
              unoptimized
              priority
              className="aspect-video w-full object-cover"
            />
          )}
        </div>
      </section>

      <section className="bg-neutral-950 text-white">
        <dl className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
          {proof.map((item) => (
            <div key={item.label}>
              <dd className="font-heading text-5xl font-extrabold text-primary">{item.value}</dd>
              <dt className="text-sm text-neutral-300">{item.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-12">
        <SeasonGoal />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {audiences.map((item) => (
          <article key={item.title} className="flex flex-col rounded-lg border p-5">
            <h2 className="text-2xl text-primary">{item.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.text}</p>
            <Link
              href={item.href}
              className={buttonVariants({ variant: "outline", className: "mt-4 self-start px-4" })}
            >
              {item.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="border-t bg-neutral-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <h2 className="text-3xl">How the money flows</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step} className="rounded-lg bg-white p-4">
                <span className="font-heading text-3xl font-extrabold text-primary">
                  {index + 1}
                </span>
                <p className="mt-1 text-sm">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Sources: Utah Athletics (titles, 2015 record), Salt Lake Tribune (2025 average).
          </p>
        </div>
      </section>
    </>
  );
}
