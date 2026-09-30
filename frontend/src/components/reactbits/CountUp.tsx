"use client";

import { useEffect, useRef } from "react";

// Count-up number in the style of React Bits' CountUp. Starts when scrolled into view.
// Writes to the DOM directly so each animation frame doesn't re-render React.
const fmt = (n: number) => n.toLocaleString("en-US");

export default function CountUp({
  to,
  from = 0,
  duration = 1.4,
  delay = 0,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(to);
      return;
    }
    let raf = 0;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      timer = window.setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = fmt(Math.round(from + (to - from) * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, delay * 1000);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {fmt(from)}
    </span>
  );
}
