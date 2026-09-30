"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Press and hold to confirm. Releasing early cancels. Works with pointer and Space/Enter.
export default function HoldButton({
  children,
  onConfirm,
  duration = 1200,
  className,
  fillClassName = "bg-ruby",
}: {
  children: ReactNode;
  onConfirm: () => void;
  duration?: number;
  className?: string;
  fillClassName?: string;
}) {
  const [progress, setProgress] = useState(0);
  const raf = useRef(0);
  const start = useRef(0);

  function begin() {
    cancelAnimationFrame(raf.current);
    start.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start.current) / duration);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        onConfirm();
        setTimeout(() => setProgress(0), 300);
      }
    };
    raf.current = requestAnimationFrame(tick);
  }

  function cancel() {
    cancelAnimationFrame(raf.current);
    setProgress((p) => (p < 1 ? 0 : p));
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          begin();
        }
      }}
      onKeyUp={cancel}
      className={cn("relative isolate select-none overflow-hidden", className)}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 -z-10 opacity-20", fillClassName)}
        style={{ width: `${progress * 100}%`, transition: progress === 0 ? "width 200ms ease" : "none" }}
      />
      {children}
    </button>
  );
}
