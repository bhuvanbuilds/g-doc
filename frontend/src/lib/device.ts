"use client";

import { useSyncExternalStore } from "react";

// Phones, tablets and low-end machines: touch-first or few cores, or the user asked to save data.
// Heavy effects (WebGL shaders, cursor trails) check this and render a cheaper version.
export function isLiteDevice(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return (
    window.matchMedia("(pointer: coarse), (max-width: 767px)").matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}

// Live media-query match. Renders `false` on the server and during hydration.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
