"use client";

import { useMemo, useSyncExternalStore } from "react";
import { snapshot, subscribe, type StoredInvestigation } from "@/lib/history";

// `null` while rendering on the server / before hydration.
export function useInvestigations(): StoredInvestigation[] | null {
  const raw = useSyncExternalStore(subscribe, snapshot, () => undefined);
  return useMemo(() => {
    if (raw === undefined) return null;
    if (!raw) return [];
    try {
      return JSON.parse(raw) as StoredInvestigation[];
    } catch {
      return [];
    }
  }, [raw]);
}
