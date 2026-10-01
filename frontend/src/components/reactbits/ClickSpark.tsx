"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Click spark effect in the style of React Bits' ClickSpark, applied page-wide.
type Spark = { x: number; y: number; angle: number; start: number };

type Props = {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  extraScale?: number;
};

const easeOut = (t: number) => t * (2 - t);

export default function ClickSpark({
  children,
  sparkColor = "#2667FF",
  sparkSize = 10,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 420,
  extraScale = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let sparks: Spark[] = [];
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Sized lazily on tap: mobile browsers fire resize whenever the URL bar
    // shows or hides, and reallocating a full-screen canvas mid-scroll janks.
    const fit = () => {
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      sparks = sparks.filter((s) => {
        const t = (now - s.start) / duration;
        if (t >= 1) return false;
        const e = easeOut(t);
        const dist = e * sparkRadius * extraScale;
        const len = sparkSize * (1 - e);
        const x1 = s.x + dist * Math.cos(s.angle);
        const y1 = s.y + dist * Math.sin(s.angle);
        const x2 = s.x + (dist + len) * Math.cos(s.angle);
        const y2 = s.y + (dist + len) * Math.sin(s.angle);
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });

      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };

    const onClick = (e: PointerEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      fit();
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / sparkCount,
          start: now,
        });
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };

    window.addEventListener("pointerdown", onClick, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale]);

  return (
    <>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        width={0}
        height={0}
        className="pointer-events-none fixed inset-0 z-[100] h-screen w-screen"
      />
    </>
  );
}
