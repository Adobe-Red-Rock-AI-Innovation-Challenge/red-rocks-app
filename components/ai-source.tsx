import { Sparkles } from "lucide-react";
import type { AiSource as Source } from "@/lib/ai";

// Viewers should always be able to tell real Claude output from the scripted demo fallback.
export function AiSource({ source }: { source: Source }) {
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <Sparkles className="size-3" />
      {source === "claude"
        ? "Written by Claude"
        : source === "script"
          ? "Scripted demo answer"
          : "Demo AI (sample output, no API key set)"}
    </p>
  );
}
