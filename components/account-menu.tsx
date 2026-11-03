"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
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
import { roles } from "@/lib/roles";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toUpperCase();
}

export function AccountMenu() {
  const router = useRouter();
  const { state } = useDemo();
  const { user, notifications } = state;

  if (!user) {
    return (
      <Link href="/login" className={buttonVariants({ className: "px-4" })}>
        Sign in
      </Link>
    );
  }

  const unread = notifications.filter((item) => !item.read).length;
  const subtitle = user.organization ?? roles.find((role) => role.id === state.role)?.label;

  function markAllRead() {
    setDemoState((current) => ({
      ...current,
      notifications: current.notifications.map((item) => ({ ...item, read: true })),
    }));
  }

  return (
    <div className="flex items-center gap-2">
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
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-full bg-neutral-100 py-1 pr-1 text-left hover:bg-neutral-200 sm:pl-4">
          <span className="hidden max-w-44 sm:block">
            <span className="block truncate text-sm font-bold leading-tight">{user.name}</span>
            <span className="block truncate text-xs leading-tight text-muted-foreground">
              {subtitle}
            </span>
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
            {initials(user.name)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-2">
          <div className="px-2 py-1.5">
            <p className="truncate font-bold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
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
