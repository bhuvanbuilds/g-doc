"use client";

import { useEffect, useRef, useState } from "react";

// React Bits "DecryptedText": characters scramble, then resolve left to right.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*@$";

export default function DecryptedText({
  text,
  className,
  speed = 28,
  animateOn = "view",
}: {
  text: string;
  className?: string;
  speed?: number;
  animateOn?: "view" | "hover" | "both";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  const running = useRef(false);

  function run() {
    if (running.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    running.current = true;
    let revealed = 0;
    const id = window.setInterval(() => {
      revealed += 0.5;
      const n = Math.floor(revealed);
      setOut(
        text
          .split("")
          .map((c, i) => (c === " " || i < n ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("")
      );
      if (n >= text.length) {
        clearInterval(id);
        running.current = false;
        setOut(text);
      }
    }, speed);
  }

  useEffect(() => {
    if (animateOn === "hover") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        run();
      }
    });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animateOn]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      onMouseEnter={animateOn !== "view" ? run : undefined}
    >
      <span aria-hidden className="font-[inherit]">
        {out}
      </span>
    </span>
  );
}
