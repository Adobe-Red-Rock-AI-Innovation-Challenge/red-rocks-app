import type { Role } from "@/lib/types";

export const roles: { id: Role; label: string; home: string }[] = [
  { id: "fan", label: "Fan", home: "/" },
  { id: "sponsor", label: "Sponsor", home: "/sponsor/packages" },
  { id: "athlete", label: "Athlete", home: "/athlete/dashboard" },
];

export const navByRole: Record<Role, { href: string; label: string }[]> = {
  fan: [
    { href: "/athletes", label: "Athletes" },
    { href: "/fan/join", label: "Join" },
    { href: "/fan/dashboard", label: "My Pass" },
  ],
  sponsor: [
    { href: "/sponsor/packages", label: "Packages" },
    { href: "/sponsor", label: "Find Athletes" },
    { href: "/sponsor/deals", label: "Deals" },
    { href: "/sponsor/results", label: "Results" },
  ],
  athlete: [
    { href: "/athlete/dashboard", label: "Deals" },
    { href: "/athlete/setup", label: "Profile Setup" },
  ],
};

// Shared pages such as /impact keep whichever role was last chosen.
export function roleForPath(pathname: string): Role | null {
  if (pathname.startsWith("/fan") || pathname.startsWith("/athletes")) return "fan";
  if (pathname.startsWith("/sponsor")) return "sponsor";
  if (pathname.startsWith("/athlete/")) return "athlete";
  return null;
}
