import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// Set this to a file in /public (e.g. "/media/hero.mp4") to use an Adobe video instead of the image.
const HERO_VIDEO: string | null = null;
const HERO_IMAGE = "/images/hero.svg";

const highlights = [
  { title: "VIP Pass", text: "A digital member card with rewards from local sponsors." },
  { title: "Quests", text: "Fund athlete projects together and unlock what they make." },
  { title: "Thank-yous", text: "Back an athlete and hear from them in your inbox." },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <h1 className="text-5xl sm:text-6xl">Be part of every routine</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Join the Red Rocks community, back the athletes you love and unlock moments only
            members get to see.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/fan/join" className={buttonVariants({ size: "lg", className: "px-5" })}>
              Join
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

      <section className="border-t bg-neutral-50">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title}>
              <h2 className="text-2xl text-primary">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
