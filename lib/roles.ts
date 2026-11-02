import type { Role } from "@/lib/types";

export const roles: { id: Role; label: string; home: string }[] = [
  { id: "fan", label: "Fan", home: "/" },
  { id: "sponsor", label: "Sponsor", home: "/sponsor/packages" },
  { id: "athlete", label: "Athlete", home: "/athlete/tasks" },
];

export const navByRole: Record<Role, { href: string; label: string }[]> = {
  fan: [
    { href: "/athletes", label: "Athletes" },
    { href: "/fan/join", label: "Join" },
    { href: "/fan/dashboard", label: "My Pass" },
  ],
  sponsor: [
    { href: "/sponsor/packages", label: "Packages" },
    { href: "/sponsor/athletes", label: "Athletes" },
    { href: "/sponsor/planner", label: "Planner" },
    { href: "/sponsor/requests", label: "Requests" },
    { href: "/sponsor/deals", label: "Deals" },
    { href: "/sponsor/results", label: "Results" },
    { href: "/sponsor/redeem", label: "Redeem" },
  ],
  athlete: [
    { href: "/athlete/tasks", label: "Tasks" },
    { href: "/athlete/dashboard", label: "Deals" },
    { href: "/athlete/messages", label: "Messages" },
    { href: "/athlete/opportunities", label: "Opportunities" },
    { href: "/athlete/setup", label: "Profile" },
  ],
};

// Shared pages such as /impact keep whichever role was last chosen.
export function roleForPath(pathname: string): Role | null {
  if (pathname.startsWith("/fan") || pathname.startsWith("/athletes/") || pathname === "/athletes") {
    return "fan";
  }
  if (pathname.startsWith("/sponsor")) return "sponsor";
  if (pathname.startsWith("/athlete/")) return "athlete";
  return null;
}
