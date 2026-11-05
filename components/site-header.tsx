"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AccountMenu } from "@/components/account-menu";
import { useDemo } from "@/components/demo-provider";
import { navByRole, roleForPath, roles } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setRole, reset } = useDemo();
  const activeRole = roleForPath(pathname) ?? state.role;
  const links = [
    ...navByRole[activeRole],
    { href: "/gifts", label: "Gifts" },
    // The revenue model is business detail, so fans see their own money story on Join and My Pass instead.
    ...(activeRole === "fan" ? [] : [{ href: "/impact", label: "Impact" }]),
  ];

  function handleReset() {
    if (!window.confirm("Clear everything done in this demo?")) return;
    reset();
    toast.success("Demo reset");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-neutral-950 text-white">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold tracking-wider uppercase text-neutral-400">
              Demo as:
            </span>
            <div role="group" aria-label="Demo role" className="flex rounded-md bg-neutral-800 p-0.5">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={activeRole === role.id}
                  onClick={() => {
                    setRole(role.id);
                    router.push(role.home);
                  }}
                  className={cn(
                    "rounded px-2.5 py-1 text-sm font-semibold transition-colors",
                    activeRole === role.id
                      ? "bg-primary text-primary-foreground"
                      : "text-neutral-300 hover:text-white",
                  )}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset demo"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-0.5 px-4 py-2 sm:flex-nowrap">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/images/brand/utah-gymnastics.png"
              alt=""
              width={252}
              height={180}
              preload
              className="h-10 w-auto rounded-md"
            />
            <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">UTAH GYMNASTICS</span>
          </Link>
          <nav
            aria-label="Main"
            className="order-last flex w-full min-w-0 gap-5 overflow-x-auto sm:order-none sm:w-auto sm:flex-1"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "py-1 text-sm font-semibold whitespace-nowrap hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-neutral-600",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto shrink-0">
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
