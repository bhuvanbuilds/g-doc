"use client";

import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// React Bits "TrueFocus": one word is sharp inside a corner frame, the rest stay blurred.
// Cycles automatically; hovering a word focuses it.
export default function TrueFocus({
  sentence,
  className,
  blur = 5,
  duration = 0.5,
  pause = 1.4,
  frameColor = "#D5A021",
  glowColor = "rgb(213 160 33 / 0.6)",
}: {
  sentence: string;
  className?: string;
  blur?: number;
  duration?: number;
  pause?: number;
  frameColor?: string;
  glowColor?: string;
}) {
  const words = sentence.split(" ");
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const wrap = useRef<HTMLSpanElement>(null);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const active = hover ?? index;

  useEffect(() => {
    if (hover !== null) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), (duration + pause) * 1000);
    return () => clearInterval(t);
  }, [hover, words.length, duration, pause]);

  useLayoutEffect(() => {
    const el = refs.current[active];
    const parent = wrap.current;
    if (!el || !parent) return;
    const a = el.getBoundingClientRect();
    const b = parent.getBoundingClientRect();
    setRect({ x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height });
  }, [active]);

  return (
    <span ref={wrap} className={cn("relative inline-flex flex-wrap gap-x-[0.35em]", className)} aria-label={sentence}>
      {words.map((w, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-hidden
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          className="relative cursor-default transition-[filter] ease-out"
          style={{ filter: i === active ? "blur(0px)" : `blur(${blur}px)`, transitionDuration: `${duration}s` }}
        >
          {w}
        </span>
      ))}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0"
        animate={{ x: rect.x - 6, y: rect.y - 4, width: rect.w + 12, height: rect.h + 8 }}
        transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
        style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
      >
        {(["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"] as const).map((c) => (
          <span key={c} className={cn("absolute size-3 rounded-[2px]", c)} style={{ borderColor: frameColor }} />
        ))}
      </motion.span>
    </span>
  );
}
