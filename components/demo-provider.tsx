"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  resetDemoState,
  setDemoState,
  subscribe,
} from "@/lib/demo-store";
import type { DemoState, Role } from "@/lib/types";

type DemoContextValue = {
  state: DemoState;
  setRole: (role: Role) => void;
  reset: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(
    () => ({
      state,
      setRole: (role: Role) => setDemoState((prev) => ({ ...prev, role })),
      reset: resetDemoState,
    }),
    [state],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
