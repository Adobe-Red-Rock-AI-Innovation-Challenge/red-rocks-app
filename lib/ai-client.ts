import type { AiInput, AiOutput, AiSource, AiTask } from "@/lib/ai";

export async function askAi<T extends AiTask>(
  task: T,
  input: AiInput<T>,
): Promise<{ data: AiOutput<T>; source: AiSource }> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, input }),
  });
  if (!response.ok) throw new Error("AI request failed");
  return response.json();
}
