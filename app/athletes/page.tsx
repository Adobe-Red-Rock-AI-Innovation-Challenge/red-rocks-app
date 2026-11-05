import Image from "next/image";
import Link from "next/link";
import { athletes } from "@/lib/data";

export default function AthletesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Athletes</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {athletes.map((athlete, index) => (
          <Link
            key={athlete.id}
            href={`/athletes/${athlete.id}`}
            className="overflow-hidden rounded-lg border transition-colors hover:border-primary"
          >
            <Image
              src={athlete.image}
              alt=""
              width={400}
              height={400}
              unoptimized
              loading="eager"
              fetchPriority={index < 4 ? "high" : "auto"}
              className="aspect-square w-full object-cover"
            />
            <div className="p-4">
              <h2 className="text-2xl">{athlete.name}</h2>
              <p className="text-sm text-muted-foreground">
                {athlete.event} · {athlete.year}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
