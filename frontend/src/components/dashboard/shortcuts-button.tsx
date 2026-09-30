"use client";

import { Keyboard } from "lucide-react";
import { openShortcuts } from "@/components/shortcuts";

export function ShortcutsButton() {
  return (
    <button
      onClick={openShortcuts}
      title="Keyboard shortcuts (?)"
      className="ml-auto hidden items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] text-muted transition hover:border-line-strong hover:text-fg sm:flex"
    >
      <Keyboard className="size-3.5" />
      Shortcuts
      <kbd className="rounded border border-line bg-panel px-1 font-mono text-[11px]">?</kbd>
    </button>
  );
}
