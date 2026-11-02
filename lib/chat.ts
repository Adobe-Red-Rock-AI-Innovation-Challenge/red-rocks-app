import { notification, setDemoState } from "@/lib/demo-store";
import type { Conversation } from "@/lib/types";

export const MAX_MESSAGE_LENGTH = 400;

// Fans write to student-athletes, so contact details and links never go through.
const CONTACT = /(@[a-z0-9_.]{2,}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|https?:\/\/|www\.|\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b|snap(chat)?|whats ?app|telegram|venmo|cash ?app)/i;

export function messageProblem(text: string) {
  const clean = text.trim();
  if (!clean) return "Write a message first.";
  if (clean.length > MAX_MESSAGE_LENGTH) return `Keep it under ${MAX_MESSAGE_LENGTH} characters.`;
  if (CONTACT.test(clean)) {
    return "For everyone's safety, messages can't include links, handles, emails or phone numbers.";
  }
  return null;
}

function message(from: "fan" | "athlete", text: string) {
  return { id: crypto.randomUUID(), from, text: text.trim(), createdAt: new Date().toISOString() };
}

export function sendFanMessage(athleteId: string, fanName: string, text: string) {
  setDemoState((state) => {
    const existing = state.conversations.find(
      (item) => item.athleteId === athleteId && item.fanName === fanName,
    );
    if (existing?.blocked) return state;
    const conversations: Conversation[] = existing
      ? state.conversations.map((item) =>
          item.id === existing.id ? { ...item, messages: [...item.messages, message("fan", text)] } : item,
        )
      : [
          { id: crypto.randomUUID(), athleteId, fanName, messages: [message("fan", text)] },
          ...state.conversations,
        ];
    return {
      ...state,
      conversations,
      notifications: [
        notification(`New fan message from ${fanName}`, "/athlete/messages"),
        ...state.notifications,
      ],
    };
  });
}

export function sendAthleteReply(conversationId: string, text: string) {
  setDemoState((state) => ({
    ...state,
    conversations: state.conversations.map((item) =>
      item.id === conversationId ? { ...item, messages: [...item.messages, message("athlete", text)] } : item,
    ),
    notifications: [notification("An athlete replied to you", "/fan/dashboard"), ...state.notifications],
  }));
}

export function setBlocked(conversationId: string, blocked: boolean) {
  setDemoState((state) => ({
    ...state,
    conversations: state.conversations.map((item) =>
      item.id === conversationId ? { ...item, blocked } : item,
    ),
  }));
}

export function awaitingReply(conversation: Conversation) {
  return !conversation.blocked && conversation.messages.at(-1)?.from === "fan";
}
