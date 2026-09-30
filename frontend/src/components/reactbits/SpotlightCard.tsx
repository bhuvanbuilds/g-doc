"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Cursor-following glow in the style of React Bits' SpotlightCard.
export default function SpotlightCard({
  children,
  className,
  spotlightColor = "rgb(38 103 255 / 0.18)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--sx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }}
      className={cn("group/spot relative overflow-hidden", className)}
      style={{ ["--spot" as string]: spotlightColor }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--sx) var(--sy), var(--spot), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}
