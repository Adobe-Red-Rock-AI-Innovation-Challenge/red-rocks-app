import testimonials from "@/data/testimonials.json";

export type Testimonial = { quote: string; name: string; business: string; role: string; date: string };

export const quotes = testimonials as Testimonial[];

// Real quotes only: add them to data/testimonials.json after each interview. Hidden until then.
export function BusinessQuotes() {
  if (quotes.length === 0) return null;

  return (
    <section aria-labelledby="quotes-title" className="mt-12">
      <h2 id="quotes-title" className="text-3xl">What local businesses told us</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {quotes.map((item) => (
          <figure key={`${item.business}-${item.date}`} className="rounded-2xl border p-5">
            <blockquote className="text-lg">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              {item.name}, {item.role}, {item.business} · Interviewed {item.date}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
