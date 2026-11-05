"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageCircle } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setDemoState, signOut } from "@/lib/demo-store";
import { awaitingReply } from "@/lib/chat";
import { athletes } from "@/lib/data";
import { roleForPath, roles } from "@/lib/roles";
import type { DemoNotification, Role } from "@/lib/types";

// A notification belongs to the role whose pages it links to, so each demo role sees only its own.
function isFor(item: DemoNotification, role: Role) {
  const owner = roleForPath(item.href.split("?")[0]);
  return owner === null || owner === role;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toUpperCase();
}

export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useDemo();
  const { user } = state;
  const activeRole = roleForPath(pathname) ?? state.role;
  const notifications = state.notifications.filter((item) => isFor(item, activeRole));

  if (!user) {
    return (
      <Link href="/login" className={buttonVariants({ className: "px-4" })}>
        Sign in
      </Link>
    );
  }

  const unread = notifications.filter((item) => !item.read).length;
  // The chip follows the role being demoed. Business accounts carry an organization, so a business
  // signed in shows as itself only on sponsor pages, and as the athlete in view or a demo fan elsewhere.
  const athlete = athletes.find((item) => item.id === state.activeAthleteId);
  const roleLabel = roles.find((role) => role.id === activeRole)?.label;
  const isBusiness = Boolean(user.organization);
  const ownRole = activeRole === "sponsor" ? isBusiness : activeRole === "fan" && !isBusiness;
  const displayName =
    activeRole === "athlete" && athlete ? athlete.name : ownRole ? user.name : `Demo ${roleLabel}`;
  const subtitle = activeRole === "sponsor" && isBusiness ? user.organization : roleLabel;
  const waiting = state.conversations.filter((item) => item.athleteId === athlete?.id && awaitingReply(item)).length;

  function markAllRead() {
    setDemoState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        isFor(item, activeRole) ? { ...item, read: true } : item,
      ),
    }));
  }

  return (
    <div className="flex items-center gap-2">
      {activeRole === "athlete" && athlete && (
        <Link
          href="/athlete/messages"
          aria-label={`Fan messages, ${waiting} waiting for a reply`}
          className="relative flex size-10 items-center justify-center rounded-full bg-neutral-100 text-primary hover:bg-neutral-200"
        >
          <MessageCircle className="size-5" />
          {waiting > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {waiting}
            </span>
          )}
        </Link>
      )}
      <DropdownMenu onOpenChange={(open) => !open && markAllRead()}>
        <DropdownMenuTrigger
          aria-label={`Notifications, ${unread} unread`}
          className="relative flex size-10 items-center justify-center rounded-full bg-neutral-100 text-primary hover:bg-neutral-200"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {unread}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2">
          {notifications.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {notifications.slice(0, 8).map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => router.push(item.href)}
              className="items-start whitespace-normal"
            >
              {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              {item.text}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-full bg-neutral-100 py-1 pr-1 text-left hover:bg-neutral-200 xl:pl-4">
          <span className="hidden max-w-44 xl:block">
            <span className="block truncate text-sm font-bold leading-tight">{displayName}</span>
            <span className="block truncate text-xs leading-tight text-muted-foreground">
              {subtitle}
            </span>
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
            {initials(displayName)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-2">
          <div className="px-2 py-1.5">
            <p className="truncate font-bold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          {activeRole === "athlete" && (
            <DropdownMenuItem onClick={() => router.push("/athlete/setup")}>Athlete profile</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
          {user.isAdmin && (
            <DropdownMenuItem onClick={() => router.push("/admin")}>Team access</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push("/how-it-works")}>
            How it works
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-primary"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
