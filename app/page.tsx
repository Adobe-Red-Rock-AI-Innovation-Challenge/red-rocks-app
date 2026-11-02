import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { AthleteCarousel } from "@/components/home/athlete-carousel";
import { SpotlightShowcase, type ShowcaseItem } from "@/components/spotlight-showcase";
import { JoinForm } from "@/components/home/join-form";
import { ReachSection } from "@/components/home/reach-section";
import { SeasonGoal } from "@/components/season-goal";
import { plans } from "@/lib/checkout";
import type { Membership } from "@/lib/types";

// Photos come from the Red Rocks digital assets the course shared for this challenge.
const photos = {
  hero: "/images/home/hero.webp",
  insider: "/images/home/insider.webp",
  allAccess: "/images/home/all-access.webp",
  innerCircle: "/images/home/inner-circle.webp",
};

// Real gymnasts appear here without names, because the athlete profiles in this demo are fictional.
const moments: ShowcaseItem[] = [
  { id: "floor-home", image: "/images/moments/floor-home.webp", alt: "A Red Rocks gymnast finishing a floor routine at home", title: "Floor finish", subtitle: "Huntsman Center" },
  { id: "salt-flats", image: "/images/moments/salt-flats.webp", alt: "A gymnast in a red leotard leaping on the Bonneville Salt Flats", title: "Salt Flats leap", subtitle: "Season photo shoot" },
  { id: "beam", image: "/images/moments/beam.webp", alt: "A Red Rocks gymnast posing on the balance beam", title: "Beam poise", subtitle: "Huntsman Center" },
  { id: "floor-cal", image: "/images/moments/floor-cal.webp", alt: "A Red Rocks gymnast smiling during a road floor routine", title: "Road floor routine", subtitle: "Away meet" },
  { id: "floor-pose", image: "/images/moments/floor-pose.webp", alt: "A Red Rocks gymnast in a black leotard holding a floor pose", title: "Floor pose", subtitle: "Away meet" },
  { id: "floor-road", image: "/images/moments/floor-road.webp", alt: "Red Rocks gymnasts celebrating on the floor", title: "Team energy", subtitle: "Away meet" },
].map((moment) => ({
  ...moment,
  actions: [
    { href: "#athletes", label: "Meet the athletes" },
    { href: "/fan/join", label: "Join the Fan Club" },
  ],
}));

const heroLinks = [
  { href: "#about", label: "About Red Rocks" },
  { href: "#athletes", label: "Meet the Athletes" },
  { href: "#partners", label: "Brand Partnerships" },
  { href: "#fan-club", label: "Fan Club" },
];

// Every figure below is sourced: Utah Athletics (titles, attendance, home streak) and the
// team's program history brief (Final Fours).
const stats = [
  {
    title: "10 National Championships",
    text: "9 NCAA titles and 1 AIAW crown, including six straight from 1981 to 1986.",
    photo: "/images/home/titles.webp",
  },
  {
    title: "#1 Nationally in Attendance",
    text: "Led the nation in gymnastics attendance in 36 of 39 seasons. NCAA record crowd: 16,019.",
    photo: "/images/home/attendance.webp",
  },
  {
    title: "5 Straight Final Fours",
    text: "In the NCAA team final every year from 2021 to 2025.",
    photo: "/images/home/final-fours.webp",
  },
  {
    title: "170 Home Wins in a Row",
    text: "The longest home win streak in any NCAA sport, from 1979 to 2002.",
    photo: "/images/home/home-wins.webp",
  },
];

const clubs: { plan: Membership; badge: string; photo: string }[] = [
  { plan: "duo", badge: "Most popular", photo: photos.insider },
  { plan: "family", badge: "Premium", photo: photos.allAccess },
  { plan: "inner", badge: "VIP", photo: photos.innerCircle },
];

export default function Home() {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-16 px-4 py-8">
      <section
        className="relative overflow-hidden rounded-3xl bg-neutral-900 bg-cover text-white"
        style={{ backgroundImage: `url(${photos.hero})`, backgroundPosition: "50% 38%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
        <div className="absolute top-0 left-1/2 flex h-14 w-28 -translate-x-1/2 items-center justify-center rounded-b-3xl bg-primary">
          <Image src="/images/home/u-hands.png" alt="" width={44} height={44} className="size-11 object-contain" />
        </div>
        <div className="relative flex min-h-[32rem] flex-col p-5 pt-16 sm:p-8 sm:pt-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Home sections" className="flex flex-wrap gap-2">
              {heroLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/70 px-3 py-1 text-xs font-medium hover:bg-white/15"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <a
              href="#join"
              className="flex items-center gap-1.5 rounded-full bg-primary py-1 pr-1 pl-3 text-xs font-semibold"
            >
              Get Involved
              <ArrowUpRight className="size-5 rounded-full bg-white p-1 text-primary" />
            </a>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold sm:text-6xl">
            UTAH GYMNASTICS
            <span className="mt-1 block text-2xl font-bold text-white/70 sm:text-5xl">
              The <span className="text-primary">Red</span> Rocks
            </span>
          </h1>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-16">
            <p className="max-w-md text-sm font-medium sm:text-base">
              Meet the women behind Utah Gymnastics. Discover their stories, connect with their
              community, and explore partnerships that bring their impact beyond the arena.
            </p>
            <Link
              href="/fan/join"
              className="rounded-2xl bg-white/90 p-4 text-xs text-foreground backdrop-blur"
            >
              <span className="block">Join the</span>
              <span className="block font-semibold text-primary">Red Rocks Fan Club</span>
              <span className="mt-2 flex items-center gap-1 rounded-full border px-3 py-1 font-semibold">
                Get your VIP Pass <ArrowUpRight className="size-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <SeasonGoal />

      <section id="about" className="grid scroll-mt-28 gap-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-2xl text-primary sm:text-3xl">
            More Than a Team.
            <br />A Utah Tradition.
          </h2>
          <p className="mt-4 text-sm">
            The Red Rocks bring strength, creativity and connection to every performance.
          </p>
          <p className="mt-3 text-sm">
            Get to know the athletes behind the routines and the community cheering them on.
          </p>
          <Link
            href="/how-it-works"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 py-2 pr-2 pl-4 text-sm font-semibold text-white"
          >
            Discover Our Story
            <ArrowRight className="size-5 rounded-full bg-white p-1 text-neutral-950" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <article
              key={stat.title}
              className="relative flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white"
            >
              <Image src={stat.photo} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#5a0000]/55 to-black/10" />
              <h3 className="relative text-xl">{stat.title}</h3>
              <p className="relative mt-1 text-xs text-white/90">{stat.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="moments-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 id="moments-title" className="text-2xl sm:text-3xl">
            Red Rocks <span className="text-primary">Moments</span>
          </h2>
          <p className="text-sm text-muted-foreground">Hover to light one up. Click to zoom in.</p>
        </div>
        <SpotlightShowcase label="Red Rocks moments" items={moments} />
      </section>

      <AthleteCarousel />

      <ReachSection />

      <section id="fan-club" className="scroll-mt-28 rounded-3xl bg-primary p-5 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
              Fan Club Membership
            </span>
            <h2 className="text-lg font-medium">A closer look at the team you love</h2>
          </div>
          <Link
            href="/fan/join"
            className="flex h-9 items-center gap-1 rounded-full bg-neutral-950 px-4 text-sm font-semibold"
          >
            View All <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {clubs.map((club) => (
            <Link
              key={club.plan}
              href="/fan/join"
              className="relative flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl bg-neutral-900 bg-cover bg-center p-4"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(90,0,0,0.35) 55%, rgba(0,0,0,0.15)), url(${club.photo})`,
              }}
            >
              <span className="absolute top-3 right-3 rounded-full border border-white/80 px-3 py-0.5 text-xs">
                {club.badge}
              </span>
              <span className="font-heading text-3xl leading-none font-extrabold uppercase">
                {plans[club.plan].name}
              </span>
              <span className="mt-1 text-sm text-white/85">${plans[club.plan].price}/month</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" aria-hidden="true">
            <ArrowLeft className="size-8 rounded-full border border-white/60 p-2" />
            <ArrowRight className="size-8 rounded-full bg-white p-2 text-primary" />
          </div>
          <p className="max-w-sm text-right text-xs text-red-100">
            Perks change by season. Sponsor offers come from local partners.
          </p>
        </div>
      </section>

      <JoinForm />
    </div>
  );
}
