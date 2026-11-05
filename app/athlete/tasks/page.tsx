"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, CheckCircle2, Circle, Heart } from "lucide-react";
import { toast } from "sonner";
import { AthletePicker } from "@/components/athlete-picker";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { awaitingReply } from "@/lib/chat";
import { athletes } from "@/lib/data";
import { updateTask } from "@/lib/deals";
import { notification, setDemoState } from "@/lib/demo-store";
import { findProduct } from "@/lib/gifts";
import type { DemoState, Offer } from "@/lib/types";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  source: "Business" | "Fan";
  title: string;
  detail: string;
  done: boolean;
  href?: string;
  action?: string;
  complete?: () => void;
};

const businessSteps: Partial<Record<Offer["status"], string>> = {
  inquiry: "Send your quote",
  pending: "Respond to the offer",
  negotiating: "Waiting on the sponsor's answer",
  accepted: "Get NIL Go clearance",
  cleared: "Create and post the content",
};

const productTodo: Record<string, string> = {
  "shout-out": "Record a video shout-out",
  "signed-card": "Sign and mail a photo card",
  "meet-greet": "Schedule a post-meet meet and greet",
};

function completeSale(saleId: string, title: string) {
  setDemoState((current) => ({
    ...current,
    sales: current.sales.map((sale) => (sale.id === saleId ? { ...sale, done: true } : sale)),
    notifications: [notification(`Your order is on its way: ${title}`, "/fan/dashboard"), ...current.notifications],
  }));
  toast.success("Marked done. The fan was notified.");
}

// One list for everything that needs the athlete: business deals, fan orders and fan messages.
function tasksFor(state: DemoState, athleteId: string): Task[] {
  const business: Task[] = state.offers
    .filter((offer) => offer.athleteId === athleteId && offer.status !== "declined")
    .map((offer) => ({
      id: offer.id,
      source: "Business",
      title: `${offer.sponsorName}: ${offer.title}`,
      detail: businessSteps[offer.status] ?? `Done (${offer.status})`,
      done: !businessSteps[offer.status],
      href: "/athlete/dashboard",
      action: "Open deal",
    }));

  // Tasks a business set on a project; the athlete submits each one for review.
  const projectWork: Task[] = state.offers
    .filter((offer) => offer.athleteId === athleteId && offer.tasks)
    .flatMap((offer) =>
      (offer.tasks ?? []).map((task) => ({
        id: task.id,
        source: "Business" as const,
        title: `${offer.sponsorName}: ${task.title}`,
        detail:
          task.status === "changes"
            ? `Changes requested${task.comments.at(-1) ? `: ${task.comments.at(-1)?.text}` : ""}`
            : task.status === "submitted"
              ? "Submitted, waiting for the business to review"
              : task.due
                ? `Due ${new Date(task.due).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`
                : "No due date yet",
        done: task.status === "approved" || task.status === "submitted",
        action: "Submit for review",
        complete: () => {
          updateTask(offer.id, task.id, (item) => ({ ...item, status: "submitted" }));
          toast.success("Submitted for review");
        },
      })),
    );

  const orders: Task[] = state.sales
    .filter((sale) => sale.athleteId === athleteId)
    .map((sale) => {
      const product = findProduct(sale.productId);
      const title = sale.title ?? productTodo[sale.productId] ?? product?.name ?? "Fan order";
      return {
        id: sale.id,
        source: "Fan",
        title,
        detail: `Gift order · you earn $${sale.athleteShare.toFixed(2)}`,
        done: sale.done === true,
        action: "Mark done",
        complete: () => completeSale(sale.id, product?.name ?? title),
      };
    });

  const messages: Task[] = state.conversations
    .filter((item) => item.athleteId === athleteId && !item.blocked)
    .map((item) => ({
      id: item.id,
      source: "Fan",
      title: `Reply to ${item.fanName}`,
      detail: item.messages.at(-1)?.text ?? "",
      done: !awaitingReply(item),
      href: "/athlete/messages",
      action: "Reply",
    }));

  return [...business, ...projectWork, ...orders, ...messages];
}

export default function AthleteTasksPage() {
  const { state } = useDemo();
  const athlete = athletes.find((item) => item.id === state.activeAthleteId) ?? athletes[0];
  const [filter, setFilter] = useState<"All" | Task["source"]>("All");
  const tasks = tasksFor(state, athlete.id).filter((task) => filter === "All" || task.source === filter);
  const columns = [
    { title: "To do", items: tasks.filter((task) => !task.done) },
    { title: "Done", items: tasks.filter((task) => task.done) },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">My tasks</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Everything businesses and fans are waiting on, in one place.
      </p>
      <AthletePicker />

      <div role="group" aria-label="Filter tasks" className="mt-6 flex gap-2">
        {(["All", "Business", "Fan"] as const).map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {columns.map((column) => (
          <section key={column.title} aria-label={column.title} className="rounded-2xl bg-neutral-50 p-4">
            <h2 className="text-xl">
              {column.title} <span className="text-muted-foreground">({column.items.length})</span>
            </h2>
            <ul className="mt-3 grid gap-2">
              {column.items.length === 0 && <li className="text-sm text-muted-foreground">Nothing here.</li>}
              {column.items.map((task) => (
                <li key={task.id} className="rounded-xl border bg-white p-3">
                  <div className="flex items-start gap-2">
                    {task.done ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
                    ) : (
                      <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          task.source === "Business" ? "bg-neutral-900 text-white" : "bg-red-50 text-primary",
                        )}
                      >
                        {task.source === "Business" ? <Briefcase className="size-3" /> : <Heart className="size-3" />}
                        {task.source}
                      </span>
                      <p className="mt-1 font-semibold">{task.title}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{task.detail}</p>
                    </div>
                  </div>
                  {!task.done && task.action && (
                    <div className="mt-2 flex justify-end">
                      {task.complete ? (
                        <Button size="sm" onClick={task.complete}>
                          {task.action}
                        </Button>
                      ) : (
                        <Link href={task.href ?? "#"} className="text-sm font-semibold text-primary underline">
                          {task.action}
                        </Link>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
