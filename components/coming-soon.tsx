export function ComingSoon({ title, step }: { title: string; step: number }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <p className="text-sm font-semibold text-primary">Build step {step}</p>
      <h1 className="mt-1 text-4xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">This page is built in step {step}.</p>
    </div>
  );
}
