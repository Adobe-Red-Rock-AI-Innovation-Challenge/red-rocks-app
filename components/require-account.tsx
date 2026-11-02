"use client";

import { usePathname } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import { SignInPrompt } from "@/components/sign-in-prompt";
import type { Role } from "@/lib/types";

export function RequireAccount({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useDemo();

  if (state.user) return children;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <SignInPrompt next={pathname} role={role} message={`Sign in to continue as a ${role}.`} />
    </div>
  );
}
