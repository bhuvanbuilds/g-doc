import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("size-6", className)}
    >
      <rect x="1" y="1" width="22" height="22" rx="6" fill="var(--brand)" />
      <path
        d="M5.5 8.5 12 13l6.5-4.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 8.5v7h7"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <circle cx="16.5" cy="15.5" r="2.25" stroke="#fff" strokeWidth="1.6" />
    </svg>
  );
}

const SIZES = {
  md: { mark: "size-7", text: "text-[17px]", gap: "gap-2.5" },
  lg: { mark: "size-9", text: "text-[21px]", gap: "gap-3" },
};

export function Logo({ className, size = "md" }: { className?: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <LogoMark className={s.mark} />
      <span className={cn(s.text, "font-semibold tracking-[-0.02em]")}>
        {site.name}
      </span>
    </div>
  );
}
