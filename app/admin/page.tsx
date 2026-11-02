"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

async function send(method: string, body?: unknown) {
  const response = await fetch("/api/admin/members", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Request failed");
  return data.members as Member[];
}

export default function AdminPage() {
  const { state } = useDemo();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = state.user?.isAdmin === true;

  const run = useCallback(async (method: string, body?: unknown) => {
    try {
      setMembers(await send(method, body));
      setError(null);
    } catch (caught) {
      setError((caught as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    send("GET")
      .then(setMembers)
      .catch((caught: Error) => setError(caught.message));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <SignInPrompt next="/admin" message="Team admins sign in with Google to manage access." />
      </div>
    );
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run("POST", {
      name: form.get("name"),
      email: form.get("email"),
      role: form.get("role"),
      status: "active",
    });
    event.currentTarget.reset();
    toast.success("Member added");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl">Team access</h1>
      <p className="mt-2 text-muted-foreground">
        Decide who signs in as an athlete or sponsor. Admins are set in ADMIN_EMAILS.
      </p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <form onSubmit={add} className="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_10rem_auto]">
        <Input name="name" required placeholder="Name" aria-label="Name" />
        <Input name="email" type="email" required placeholder="name@gmail.com" aria-label="Email" />
        <Select name="role" aria-label="Role" defaultValue="athlete">
          <option value="athlete">Athlete</option>
          <option value="sponsor">Sponsor</option>
        </Select>
        <Button type="submit" size="lg">
          Add
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="p-3">Person</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {members?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-muted-foreground">
                  No members yet.
                </td>
              </tr>
            )}
            {members?.map((member) => (
              <tr key={member.email} className="border-t">
                <td className="p-3">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-muted-foreground">{member.email}</p>
                  {!member.registered && (
                    <p className="text-xs text-muted-foreground">Signed in, form not finished</p>
                  )}
                  {Object.entries(member.profile ?? {}).map(([key, value]) => (
                    <p key={key} className="text-xs text-muted-foreground">
                      <span className="capitalize">{key}</span>: {value}
                    </p>
                  ))}
                </td>
                <td className="p-3">
                  <Select
                    aria-label={`Role for ${member.name}`}
                    className="w-32"
                    value={member.role}
                    onChange={(event) =>
                      run("POST", { ...member, role: event.target.value })
                    }
                  >
                    <option value="athlete">Athlete</option>
                    <option value="sponsor">Sponsor</option>
                  </Select>
                </td>
                <td className="p-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      member.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800",
                    )}
                  >
                    {member.status === "active" ? "Approved" : "Waiting for approval"}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  {member.status === "pending" && (
                    <Button
                      className="mr-2"
                      onClick={() => run("POST", { ...member, status: "active" })}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm(`Remove ${member.email}?`)) {
                        run("DELETE", { email: member.email });
                      }
                    }}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
