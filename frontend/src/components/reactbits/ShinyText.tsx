import { cn } from "@/lib/utils";

// React Bits "ShinyText": a light band sweeps across the text. Styles in globals.css (.shiny-text).
export default function ShinyText({ text, className, speed = 4 }: { text: string; className?: string; speed?: number }) {
  return (
    <span className={cn("shiny-text", className)} style={{ animationDuration: `${speed}s` }}>
      {text}
    </span>
  );
}
