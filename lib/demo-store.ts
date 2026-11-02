import type { DemoState } from "@/lib/types";

const STORAGE_KEY = "red-rocks-demo-v1";

export const initialState: DemoState = {
  role: "fan",
  user: null,
  membership: null,
  giftDollars: 0,
  questContributions: {},
  claimedRewards: [],
  rsvps: [],
};

const listeners = new Set<() => void>();
let current: DemoState | null = null;

function load(): DemoState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  } catch {
    return initialState;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSnapshot(): DemoState {
  current ??= load();
  return current;
}

export function getServerSnapshot(): DemoState {
  return initialState;
}

export function subscribe(listener: () => void) {
  // The storage event keeps a second tab in sync, e.g. sponsor and athlete side by side.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = load();
    emit();
  };

  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setDemoState(update: (state: DemoState) => DemoState) {
  current = update(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Blocked storage only loses persistence; the demo keeps working in memory.
  }
  emit();
}

export function resetDemoState() {
  setDemoState(() => initialState);
}
