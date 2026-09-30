import type { InvestigateResponse } from "./types";

// The backend has no GET/list endpoint yet, so results live in this browser.
// Swap these functions for API calls once investigations are persisted server-side.

export interface StoredInvestigation {
  id: string;
  savedAt: string; // ISO
  size: number;
  result: InvestigateResponse;
}

const KEY = "tm:investigations";
const LIMIT = 40;

function read(): StoredInvestigation[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredInvestigation[]) : [];
  } catch {
    return [];
  }
}

const CHANGE = "tm:investigations-change";

function write(items: StoredInvestigation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, LIMIT)));
  } catch {
    // Quota exceeded: drop the oldest half and retry once.
    try {
      localStorage.setItem(KEY, JSON.stringify(items.slice(0, Math.floor(LIMIT / 2))));
    } catch {}
  }
  window.dispatchEvent(new Event(CHANGE));
}

// For useSyncExternalStore: raw string snapshot is stable between changes.
export function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function snapshot(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function listInvestigations(): StoredInvestigation[] {
  return read();
}

export function getInvestigation(id: string): StoredInvestigation | undefined {
  return read().find((i) => i.id === id);
}

export function saveInvestigation(result: InvestigateResponse, size: number): StoredInvestigation {
  const item: StoredInvestigation = {
    id: `inv-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    savedAt: new Date().toISOString(),
    size,
    result,
  };
  write([item, ...read()]);
  return item;
}

export function clearInvestigations() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(CHANGE));
}
