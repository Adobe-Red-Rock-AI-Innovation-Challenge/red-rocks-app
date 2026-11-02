import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Role } from "@/lib/types";

export function SignInPrompt({
  next,
  message,
  role,
}: {
  next: string;
  message: string;
  role?: Role;
}) {
  const params = new URLSearchParams({ next, ...(role && { role }) });

  return (
    <div className="rounded-lg border p-6 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Link
        href={`/login?${params}`}
        className={buttonVariants({ size: "lg", className: "mt-4 px-4" })}
      >
        Sign in
      </Link>
    </div>
  );
}
