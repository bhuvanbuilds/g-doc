import type { RiskLevel, Severity } from "@/lib/types";
import type { CheckStatus } from "@/lib/derive";

// Light-theme risk colours. `hex` feeds charts; classes feed badges and text.
export const riskStyle: Record<RiskLevel, { label: string; short: string; dot: string; text: string; badge: string; hex: string }> = {
  critical: {
    label: "Critical risk",
    short: "Critical",
    dot: "bg-[#6E0E16]",
    text: "text-[#6E0E16]",
    badge: "border-ruby bg-ruby text-snow",
    hex: "#6E0E16",
  },
  high: {
    label: "High risk",
    short: "High",
    dot: "bg-ruby",
    text: "text-high-fg",
    badge: "border-ruby/25 bg-ruby/[0.07] text-high-fg",
    hex: "#A31621",
  },
  medium: {
    label: "Medium risk",
    short: "Medium",
    dot: "bg-gold",
    text: "text-med-fg",
    badge: "border-gold/35 bg-gold/10 text-med-fg",
    hex: "#D5A021",
  },
  low: {
    label: "Low risk",
    short: "Low",
    dot: "bg-low",
    text: "text-low-fg",
    badge: "border-low/30 bg-low/10 text-low-fg",
    hex: "#2FA36B",
  },
};

export const severityStyle: Record<Severity, { label: string; badge: string; dot: string }> = {
  critical: { label: "Critical", badge: riskStyle.critical.badge, dot: riskStyle.critical.dot },
  high: { label: "High", badge: riskStyle.high.badge, dot: riskStyle.high.dot },
  medium: { label: "Medium", badge: riskStyle.medium.badge, dot: riskStyle.medium.dot },
  low: { label: "Low", badge: riskStyle.low.badge, dot: riskStyle.low.dot },
};

export const checkStyle: Record<CheckStatus, { label: string; ring: string; text: string; dot: string }> = {
  pass: { label: "Pass", ring: "border-low/30 bg-low/[0.06]", text: "text-low-fg", dot: "bg-low" },
  warn: { label: "Warning", ring: "border-gold/40 bg-gold/[0.08]", text: "text-med-fg", dot: "bg-gold" },
  fail: { label: "Fail", ring: "border-ruby/30 bg-ruby/[0.06]", text: "text-high-fg", dot: "bg-ruby" },
  none: { label: "N/A", ring: "border-line bg-panel", text: "text-muted", dot: "bg-subtle" },
};
