"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// React Bits "RotatingText": cycles through words, letters springing in one by one.
export default function RotatingText({
  words,
  interval = 2400,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className={cn("relative inline-flex overflow-hidden", className)} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={i} className="inline-flex" aria-label={words[i]}>
          {words[i].split("").map((c, j) => (
            <motion.span
              key={j}
              aria-hidden
              className="inline-block"
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-110%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 380, delay: j * 0.022 }}
            >
              {c === " " ? " " : c}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
