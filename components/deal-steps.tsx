import { Check } from "lucide-react";
import { dealStepIndex, dealSteps } from "@/lib/deals";
import type { OfferStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DealSteps({ status }: { status: OfferStatus }) {
  if (status === "declined") {
    return <p className="text-sm font-semibold text-muted-foreground">Declined</p>;
  }
  const current = dealStepIndex(status);

  return (
    <ol aria-label="Deal progress" className="flex flex-wrap gap-x-1 gap-y-2 text-xs">
      {dealSteps.map((step, index) => (
        <li
          key={step.status}
          aria-current={index === current ? "step" : undefined}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 font-semibold",
            index < current && "bg-green-100 text-green-800",
            index === current && "bg-primary text-primary-foreground",
            index > current && "bg-neutral-100 text-muted-foreground",
          )}
        >
          {index < current && <Check className="size-3" />}
          {step.label}
        </li>
      ))}
    </ol>
  );
}
