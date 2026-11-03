import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { AthleteCarousel } from "@/components/home/athlete-carousel";
import { JoinForm } from "@/components/home/join-form";
import { ReachSection } from "@/components/home/reach-section";
import { plans } from "@/lib/checkout";
import type { Membership } from "@/lib/types";

const MUSS_URL = "https://muss.utah.edu/muss-rewards/";
const PROGRAM_URL = "https://utahutes.com/sports/womens-gymnastics";

// Photos come from the Red Rocks digital assets the course shared for this challenge.
const photos = {
  hero: "/images/home/hero.webp",
  insider: "/images/home/insider.webp",
  allAccess: "/images/home/all-access.webp",
  innerCircle: "/images/home/inner-circle.webp",
};

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
    number: "10",
    title: "National Championships",
    text: "9 NCAA titles and 1 AIAW crown, including six straight from 1981 to 1986.",
    photo: "/images/home/titles.webp",
  },
  {
    number: "#1",
    title: "Nationally in Attendance",
    text: "Led the nation in gymnastics attendance in 36 of 39 seasons. NCAA record crowd: 16,019.",
    photo: "/images/home/attendance.webp",
  },
  {
    number: "5",
    title: "Straight Final Fours",
    text: "In the NCAA team final every year from 2021 to 2025.",
    photo: "/images/home/final-fours.webp",
  },
  {
    number: "170",
    title: "Home Wins in a Row",
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
        className="relative overflow-hidden rounded-3xl bg-black bg-cover text-white"
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
                  className="rounded-full border border-white/70 px-3 py-1 text-xs hover:bg-white/15"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-primary py-1 pr-1 pl-3 text-xs"
            >
              Get Involved
              <ArrowUpRight className="size-5 rounded-full bg-white p-1 text-primary" />
            </Link>
          </div>

          <h1 className="mt-6 text-3xl sm:text-6xl">
            UTAH GYMNASTICS
            <span className="mt-1 block text-2xl text-white/70 sm:text-5xl">
              The <span className="text-primary">Red</span> Rocks
            </span>
          </h1>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-16">
            <p className="max-w-md text-sm sm:text-base">
              Meet the women behind Utah Gymnastics. Discover their stories, connect with their
              community, and explore partnerships that bring their impact beyond the arena.
            </p>
            <a
              href={MUSS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-white/90 p-4 text-xs text-black backdrop-blur"
            >
              <span className="block">Download</span>
              <span className="block">
                The <span className="text-primary">MUSS</span> App
              </span>
              <span className="mt-2 flex items-center gap-1 rounded-full border border-black px-3 py-1">
                <Download className="size-3.5" /> Download
              </span>
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="grid scroll-mt-28 gap-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <FadeIn>
            <h2 className="text-2xl text-primary sm:text-3xl">
              More Than a Team.
              <br />A Utah Tradition.
            </h2>
          </FadeIn>
          <FadeIn delay={150}>
            <p className="mt-4 text-sm">
              The Red Rocks bring strength, creativity and connection to every performance.
            </p>
            <p className="mt-3 text-sm">
              Get to know the athletes behind the routines and the community cheering them on.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <a
              href={PROGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-black py-2 pr-2 pl-4 text-sm text-white"
            >
              Discover Our Story
              <ArrowRight className="size-5 rounded-full bg-white p-1 text-black" />
            </a>
          </FadeIn>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <FadeIn key={stat.title} delay={index * 120}>
              <article className="group relative flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white">
                <Image
                  src={stat.photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-cover brightness-75 transition duration-500 group-hover:brightness-110 motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#5a0000]/50 to-black/10 transition-opacity duration-500 group-hover:opacity-60" />
                <h3 className="relative origin-bottom-left transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none">
                  <span className="block text-5xl leading-none">{stat.number}</span>
                  <span className="block text-lg">{stat.title}</span>
                </h3>
                <p className="relative mt-1 text-xs text-white/90">{stat.text}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      <AthleteCarousel />

      <ReachSection />

      <section id="fan-club" className="scroll-mt-28 rounded-3xl bg-primary p-5 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs text-primary">Fan Club Membership</span>
            <h2 className="text-lg">A closer look at the team you love</h2>
          </div>
          <Link href="/fan-club" className="flex h-9 items-center gap-1 rounded-full bg-black px-4 text-sm">
            View All <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {clubs.map((club) => (
            <Link
              key={club.plan}
              href="/fan-club"
              className="group relative flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl bg-black bg-cover bg-center p-4"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(90,0,0,0.35) 55%, rgba(0,0,0,0.15)), url(${club.photo})`,
              }}
            >
              <span className="absolute top-3 right-3 rounded-full border border-white/80 px-3 py-0.5 text-xs">
                {club.badge}
              </span>
              <span className="text-2xl leading-none font-extrabold uppercase transition-transform group-hover:translate-x-1">
                {plans[club.plan].name}
              </span>
              <span className="mt-1 text-sm text-white/85">${plans[club.plan].price}/month</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-right text-xs text-red-100">
          Perks change by season. Sponsor offers come from local partners.
        </p>
      </section>

      <JoinForm />
    </div>
  );
}
