import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { riskStyle } from "./risk";

// Minimal risk marker: coloured dot, level, optional mono score. No pill, no border.
export function RiskTag({
  level,
  score,
  className,
  size = "sm",
}: {
  level: RiskLevel;
  score?: number | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const s = riskStyle[level];
  return (
    <span className={cn("inline-flex items-center gap-2 font-medium", size === "md" ? "text-[14px]" : "text-[13px]", s.text, className)}>
      <span className="relative flex size-2">
        {level === "critical" && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", s.dot)} />}
        <span className={cn("relative size-2 rounded-full", s.dot)} />
      </span>
      {s.short}
      {score !== undefined && score !== null && <span className="font-mono text-[12.5px] text-muted">{score}</span>}
    </span>
  );
}
