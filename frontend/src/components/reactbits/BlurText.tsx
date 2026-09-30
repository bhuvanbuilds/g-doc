"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ElementType } from "react";

// React Bits "BlurText": words fade in from blur, staggered, when scrolled into view.
export default function BlurText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.06,
  direction = "top",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  direction?: "top" | "bottom";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block will-change-[filter,transform]"
          initial={reduce ? false : { filter: "blur(10px)", opacity: 0, y: direction === "top" ? -12 : 12 }}
          animate={inView ? { filter: "blur(0px)", opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.55, delay: delay + i * stagger, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {w}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </Tag>
  );
}
