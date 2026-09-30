import type { ReactNode } from "react";
import { Gauge, Globe2, Paperclip, ShieldAlert } from "lucide-react";
import CountUp from "@/components/reactbits/CountUp";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

type Tile = { label: string; icon: ReactNode; color: string; glow: string; value: number | null; suffix?: string; note: string };

export function KpiTiles({
  avgScore,
  authFailPct,
  domains,
  riskyAttachments,
}: {
  avgScore: number | null;
  authFailPct: number;
  domains: number;
  riskyAttachments: number;
}) {
  const tiles: Tile[] = [
    { label: "Average risk score", icon: <Gauge />, color: "#2667FF", glow: "rgb(38 103 255 / 0.14)", value: avgScore, suffix: "/100", note: avgScore === null ? "waiting for backend scoring" : "across scored investigations" },
    { label: "Authentication failures", icon: <ShieldAlert />, color: "#A31621", glow: "rgb(163 22 33 / 0.12)", value: authFailPct, suffix: "%", note: "emails where SPF, DKIM or DMARC failed" },
    { label: "Sender domains seen", icon: <Globe2 />, color: "#D5A021", glow: "rgb(213 160 33 / 0.18)", value: domains, note: "unique From domains" },
    { label: "Dangerous attachments", icon: <Paperclip />, color: "#2FA36B", glow: "rgb(47 163 107 / 0.16)", value: riskyAttachments, note: "executable or disk-image file types" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tiles.map((t, i) => (
        <SpotlightCard key={t.label} spotlightColor={t.glow} className="rounded-2xl border border-line bg-panel p-6">
          <span className="[&>svg]:size-7 [&>svg]:stroke-[1.75px]" style={{ color: t.color }}>
            {t.icon}
          </span>
          <p className="mt-5 text-[14px] font-medium text-muted">{t.label}</p>
          <p className="mt-1 text-[36px] font-bold leading-none tracking-[-0.04em] tabular-nums">
            {t.value === null ? "–" : <CountUp to={t.value} delay={i * 0.08} />}
            {t.value !== null && t.suffix && <span className="ml-0.5 text-[18px] font-semibold text-muted">{t.suffix}</span>}
          </p>
          <p className="mt-3 text-[13px] text-muted">{t.note}</p>
        </SpotlightCard>
      ))}
    </div>
  );
}
