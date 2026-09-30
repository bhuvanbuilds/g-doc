"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Shortcut = { keys: string[]; label: string; scope?: string };

export const SHORTCUTS: Shortcut[] = [
  { keys: ["H"], label: "Investigate (home)" },
  { keys: ["D"], label: "Dashboard" },
  { keys: ["A"], label: "About" },
  { keys: ["U"], label: "Choose an .eml file", scope: "Investigate" },
  { keys: ["J"], label: "Next section", scope: "Investigation" },
  { keys: ["K"], label: "Previous section", scope: "Investigation" },
  { keys: ["1", "–", "7"], label: "Jump to section", scope: "Investigation" },
  { keys: ["E"], label: "Export JSON", scope: "Investigation" },
  { keys: ["P"], label: "Print report", scope: "Investigation" },
  { keys: ["T"], label: "Back to top" },
  { keys: ["?"], label: "Show shortcuts" },
];

export function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-line-strong bg-panel px-1.5 font-mono text-[11.5px] font-medium text-fg shadow-[0_1px_0_rgb(5_6_9/0.08)]">
      {children}
    </kbd>
  );
}

export function openShortcuts() {
  window.dispatchEvent(new Event("tm:shortcuts"));
}

// Global keys. Page-specific keys (J/K/E/P/1–7) live in the investigation view.
export function Shortcuts() {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return;
      if (e.key === "Escape") return setOpen(false);
      if (e.key === "?") return setOpen((o) => !o);
      if (path === "/login") return; // login page: no app navigation
      switch (e.key.toLowerCase()) {
        case "h":
          router.push("/home");
          break;
        case "d":
          router.push("/dashboard");
          break;
        case "a":
          router.push("/");
          break;
        case "u":
          if (path === "/home") window.dispatchEvent(new Event("tm:open-upload"));
          else router.push("/home");
          break;
        case "t":
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("tm:shortcuts", toggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("tm:shortcuts", toggle);
    };
  }, [router, path]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 16, scale: 0.97, opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 8, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="w-full max-w-[460px] rounded-2xl border border-line bg-panel p-6 text-fg shadow-[0_30px_80px_-20px_rgb(5_6_9/0.4)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Keyboard shortcuts</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted hover:bg-fg/5 hover:text-fg" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <ul className="mt-5 divide-y divide-line">
              {SHORTCUTS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-4 py-2.5 text-[14px]">
                  <span>
                    {s.label}
                    {s.scope && <span className="ml-2 text-[12px] text-subtle">{s.scope}</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, i) => (k === "–" ? <span key={i} className="text-subtle">–</span> : <Kbd key={i}>{k}</Kbd>))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] text-muted">
              Press <Kbd>Esc</Kbd> to close.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
