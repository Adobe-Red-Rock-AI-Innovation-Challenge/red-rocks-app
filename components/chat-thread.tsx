import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChatThread({
  messages,
  mine,
  names,
}: {
  messages: ChatMessage[];
  mine: ChatMessage["from"];
  names: Record<ChatMessage["from"], string>;
}) {
  return (
    <ol className="grid gap-2">
      {messages.map((item) => (
        <li
          key={item.id}
          className={cn(
            "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
            item.from === mine ? "justify-self-end bg-primary text-white" : "justify-self-start bg-neutral-100",
          )}
        >
          <span className={cn("block text-[11px] font-semibold", item.from === mine ? "text-red-100" : "text-muted-foreground")}>
            {names[item.from]}
          </span>
          {item.text}
        </li>
      ))}
    </ol>
  );
}
