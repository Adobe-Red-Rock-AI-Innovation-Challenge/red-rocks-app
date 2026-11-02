import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function SignInPrompt({ next, message }: { next: string; message: string }) {
  return (
    <div className="rounded-lg border p-6 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className={buttonVariants({ size: "lg", className: "mt-4 px-4" })}
      >
        Sign in
      </Link>
    </div>
  );
}
