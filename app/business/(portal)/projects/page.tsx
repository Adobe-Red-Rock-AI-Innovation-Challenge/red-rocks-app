"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CalendarClock, Check, MessageSquare, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useCheckout } from "@/components/checkout";
import { DealSteps } from "@/components/deal-steps";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { businessName } from "@/lib/business";
import { athletes } from "@/lib/data";
import { addTask, dealMessage, updateOffer, updateTask } from "@/lib/deals";
import { SERVICE_FEE_PERCENT } from "@/lib/packages";
import type { Offer, ProjectTask } from "@/lib/types";
import { cn } from "@/lib/utils";

const projectStatuses: Offer["status"][] = ["accepted", "cleared", "delivered", "paid", "reported"];

const taskStyles: Record<ProjectTask["status"], { label: string; className: string }> = {
  todo: { label: "Waiting on athlete", className: "bg-neutral-100" },
  submitted: { label: "Ready for review", className: "bg-yellow-100 text-yellow-900" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  changes: { label: "Changes requested", className: "bg-red-50 text-primary" },
};

function TaskRow({ offer, task }: { offer: Offer; task: ProjectTask }) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  function addComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    updateTask(offer.id, task.id, (item) => ({ ...item, comments: [...item.comments, dealMessage("sponsor", comment)] }));
    setComment("");
  }

  return (
    <li className="rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1">{task.title}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", taskStyles[task.status].className)}>
          {taskStyles[task.status].label}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="size-4" />
          <span className="sr-only">Due date and time for {task.title}</span>
          <input
            type="datetime-local"
            value={task.due ?? ""}
            onChange={(event) => updateTask(offer.id, task.id, (item) => ({ ...item, due: event.target.value || null }))}
            className="rounded-md border px-2 py-1 text-foreground"
          />
        </label>
        <Button
          size="sm"
          disabled={task.status === "approved"}
          onClick={() => {
            updateTask(offer.id, task.id, (item) => ({ ...item, status: "approved" }));
            toast.success("Task approved");
          }}
        >
          <Check /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={task.status === "changes" || task.status === "todo"}
          onClick={() => {
            updateTask(offer.id, task.id, (item) => ({ ...item, status: "changes" }));
            toast("Changes requested");
          }}
        >
          <RotateCcw /> Disapprove
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowComments(!showComments)}>
          <MessageSquare /> {task.comments.length}
        </Button>
      </div>
      {showComments && (
        <div className="mt-2 grid gap-2">
          {task.comments.map((item) => (
            <p key={item.id} className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">
              <span className="text-xs text-muted-foreground">{item.from === "sponsor" ? "You" : "Athlete"}: </span>
              {item.text}
            </p>
          ))}
          <form onSubmit={addComment} className="flex gap-2">
            <Input
              aria-label={`Comment on ${task.title}`}
              value={comment}
              maxLength={500}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment"
            />
            <Button type="submit" size="sm" disabled={!comment.trim()}>
              Post
            </Button>
          </form>
        </div>
      )}
    </li>
  );
}

function ProjectCard({ offer, pay, busy }: { offer: Offer; pay: ReturnType<typeof useCheckout>["pay"]; busy: boolean }) {
  const athlete = athletes.find((item) => item.id === offer.athleteId);
  const tasks = offer.tasks ?? [];
  const done = tasks.filter((task) => task.status === "approved").length;
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  return (
    <article className="min-w-0 rounded-2xl border p-5">
      <div className="flex flex-wrap items-center gap-3">
        {athlete && <Image src={athlete.image} alt="" width={48} height={48} className="size-12 rounded-full object-cover object-top" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {athlete?.name}
            {offer.sample && " · Sample data"}
          </p>
          <h2 className="truncate text-xl">{offer.title}</h2>
        </div>
        <p className="text-2xl font-extrabold">${offer.price.toLocaleString("en-US")}</p>
      </div>
      <div className="mt-3">
        <DealSteps status={offer.status} />
      </div>

      {tasks.length > 0 && (
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>
            {done}/{tasks.length} tasks approved
          </span>
        </div>
        <div role="progressbar" aria-label={`${offer.title} progress`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="mt-1 h-2.5 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      </div>
      )}

      <ul className="mt-4 grid gap-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} offer={offer} task={task} />
        ))}
      </ul>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          addTask(offer.id, title, due || null);
          setTitle("");
          setDue("");
        }}
        className="mt-3 flex flex-wrap gap-2"
      >
        <Input aria-label="New task" className="min-w-0 flex-1 basis-48" value={title} maxLength={140} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task" />
        <Input aria-label="Due date and time" type="datetime-local" className="w-full sm:w-auto" value={due} onChange={(event) => setDue(event.target.value)} />
        <Button type="submit" variant="outline" disabled={!title.trim()}>
          <Plus /> Add
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4 text-sm">
        {offer.status === "accepted" && <span className="text-muted-foreground">The athlete is getting NIL Go clearance.</span>}
        {offer.status === "cleared" && <span className="text-muted-foreground">Cleared. The athlete is creating the content.</span>}
        {offer.status === "delivered" && (
          <>
            <Button
              disabled={busy}
              onClick={() =>
                pay({
                  kind: "deal",
                  offerId: offer.id,
                  title: offer.title,
                  amount: Math.round(offer.price * (1 + SERVICE_FEE_PERCENT / 100)),
                })
              }
            >
              Pay ${Math.round(offer.price * (1 + SERVICE_FEE_PERCENT / 100)).toLocaleString("en-US")}
            </Button>
            <span className="text-muted-foreground">
              ${offer.price.toLocaleString("en-US")} to the athlete + {SERVICE_FEE_PERCENT}% service fee
            </span>
          </>
        )}
        {offer.status === "paid" && (
          <Button
            variant="outline"
            onClick={() => updateOffer(offer.id, { status: "reported" }, `Results published for "${offer.title}"`, "/sponsor/results")}
          >
            Close project and publish results
          </Button>
        )}
        {offer.status === "reported" && (
          <Link href="/sponsor/results" className="text-primary underline">
            See results
          </Link>
        )}
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const { state } = useDemo();
  const name = businessName(state);
  const { pay, busy, dialog } = useCheckout();
  const projects = state.offers.filter((offer) => offer.sponsorName === name && projectStatuses.includes(offer.status));

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">Projects</h1>
      <p className="mt-1 text-muted-foreground">Approved deals in progress. Review work, set dates and leave comments.</p>
      <div className="mt-6 grid grid-cols-1 gap-4">
        {projects.length === 0 && (
          <div className="rounded-2xl border p-6 text-center text-muted-foreground">
            No projects yet. Deals show up here once an athlete&apos;s quote is accepted.{" "}
            <Link href="/business/requests" className="text-primary underline">
              Go to Requests
            </Link>
          </div>
        )}
        {projects.map((offer) => (
          <ProjectCard key={offer.id} offer={offer} pay={pay} busy={busy} />
        ))}
      </div>
      {dialog}
    </div>
  );
}
