"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, CircleCheck, Download, Plus, Printer } from "lucide-react";
import CountUp from "@/components/reactbits/CountUp";
import { checkStyle, riskStyle, severityStyle } from "@/components/dashboard/risk";
import { checks, topReasons, verdict, type Check } from "@/lib/derive";
import type { StoredInvestigation } from "@/lib/history";
import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Overview({ item }: { item: StoredInvestigation }) {
  const r = item.result;
  const v = verdict(r);
  const reasons = topReasons(r, 3);
  const quick = checks(r);
  const e = r.email;

  function exportJson() {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${r.filename.replace(/\.eml$/i, "")}-investigation.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <section id="overview" className="flex min-h-[calc(100svh-64px)] flex-col gap-5 pb-6 pt-5">
      {/* identity */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[12.5px] text-muted">{r.filename}</p>
          <h1 className="mt-1 truncate text-[26px] font-semibold tracking-[-0.03em] sm:text-[30px]">
            {e.subject || "(no subject)"}
          </h1>
          <p className="mt-1 truncate text-[14px] text-muted">
            <span className="text-fg">{e.from ?? "Unknown sender"}</span>
            {e.to && <> → {e.to}</>}
            {e.date && <> · {e.date}</>}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 print:hidden">
          <button onClick={exportJson} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-[13px] font-medium hover:bg-fg/[0.03]">
            <Download className="size-4" /> JSON
          </button>
          <button onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-[13px] font-medium hover:bg-fg/[0.03]">
            <Printer className="size-4" /> Report
          </button>
          <Link href="/home" className="inline-flex h-9 items-center gap-2 rounded-lg bg-fg px-3 text-[13px] font-medium text-snow hover:bg-fg/85">
            <Plus className="size-4" /> New
          </Link>
        </div>
      </div>

      {/* verdict + why/what */}
      <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <VerdictCard level={v.level} score={v.score} confidence={v.confidence} summary={v.summary} scored={v.scored} />

        <div className="grid gap-5">
          <div className="rounded-2xl border border-line bg-panel p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Why this verdict</h2>
            {reasons.length === 0 ? (
              <p className="mt-4 text-[14px] text-muted">No risk indicators were found in this email.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {reasons.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-fg text-[12px] font-semibold text-snow">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-[15px] leading-snug">{c.label}</p>
                    {c.points !== null ? (
                      <span className="font-mono text-[13px] font-semibold text-high-fg">+{c.points}</span>
                    ) : c.severity ? (
                      <span className={cn("rounded-md border px-1.5 py-0.5 text-[11.5px] font-semibold", severityStyle[c.severity].badge)}>
                        {severityStyle[c.severity].label}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-panel p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">What to do</h2>
            {v.actions.length === 0 ? (
              <p className="mt-4 text-[14px] text-muted">No recommendations available.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {v.actions.slice(0, 3).map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] leading-snug">
                    <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-sapphire" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* quick checks */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {quick.map((c) => (
          <QuickCheck key={c.id} check={c} />
        ))}
      </div>

      <a href="#evidence" className="mx-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-fg print:hidden">
        Full evidence below <ArrowDown className="size-3.5" />
      </a>
    </section>
  );
}

function QuickCheck({ check }: { check: Check }) {
  const s = checkStyle[check.status];
  return (
    <a href={`#${check.anchor}`} className={cn("group rounded-xl border p-4 transition-colors hover:border-line-strong", s.ring)}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted">{check.label}</p>
        <ArrowRight className="size-3.5 text-subtle opacity-0 transition group-hover:opacity-100" />
      </div>
      <p className={cn("mt-2 flex items-center gap-2 text-[15px] font-semibold", s.text)}>
        <span className={cn("size-2 rounded-full", s.dot)} />
        {s.label}
      </p>
      <p className="mt-1 truncate text-[12.5px] text-muted" title={check.value}>
        {check.value}
      </p>
    </a>
  );
}

const GAUGE_R = 80;
const GAUGE_LEN = Math.PI * GAUGE_R;

function VerdictCard({
  level,
  score,
  confidence,
  summary,
  scored,
}: {
  level: RiskLevel;
  score: number | null;
  confidence: number | null;
  summary: string | null;
  scored: boolean;
}) {
  const s = riskStyle[level];
  const critical = level === "critical";
  const pct = score ?? 0;

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border p-6 sm:p-8",
        critical ? "border-ruby bg-ruby text-snow" : "border-line bg-panel"
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-[13px] font-semibold uppercase tracking-[0.06em]", critical ? "text-snow/75" : "text-muted")}>
          Verdict
        </p>
        {critical && (
          <span className="flex items-center gap-2 text-[12px] font-semibold">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-snow" />
              <span className="relative size-2 rounded-full bg-snow" />
            </span>
            Act now
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* gauge */}
        <div className="relative mx-auto h-[110px] w-[200px] shrink-0 sm:mx-0">
          <svg viewBox="0 0 200 110" className="h-full w-full">
            <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={critical ? "rgb(252 247 248 / 0.25)" : "#ECE7E5"} strokeWidth="14" strokeLinecap="round" />
            {score !== null && (
              <path
                d="M20 100 A80 80 0 0 1 180 100"
                fill="none"
                stroke={critical ? "#FCF7F8" : s.hex}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={GAUGE_LEN}
                strokeDashoffset={GAUGE_LEN * (1 - pct / 100)}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)" }}
              />
            )}
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="text-[40px] font-bold leading-none tracking-[-0.04em] tabular-nums">
              {score !== null ? <CountUp to={score} /> : "–"}
            </p>
            <p className={cn("mt-1 text-[12px]", critical ? "text-snow/70" : "text-muted")}>
              {scored ? "risk score / 100" : "score pending"}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <p className={cn("text-[40px] font-bold leading-none tracking-[-0.04em] sm:text-[48px]", critical ? "text-snow" : s.text)}>
            {s.short}
          </p>
          <p className={cn("mt-1 text-[15px] font-medium", critical ? "text-snow/85" : "text-fg")}>{s.label}</p>
          {confidence !== null && (
            <div className="mt-4 w-[220px] max-w-full">
              <div className={cn("flex justify-between text-[12.5px]", critical ? "text-snow/75" : "text-muted")}>
                <span>Confidence</span>
                <span className="font-mono">{Math.round(confidence * 100)}%</span>
              </div>
              <div className={cn("mt-1.5 h-1.5 overflow-hidden rounded-full", critical ? "bg-snow/25" : "bg-fg/[0.07]")}>
                <div
                  className={cn("h-full rounded-full", critical ? "bg-snow" : "bg-sapphire")}
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {summary && (
        <p className={cn("mt-6 border-t pt-5 text-[15.5px] leading-relaxed", critical ? "border-snow/20 text-snow/90" : "border-line text-fg/85")}>
          {summary}
        </p>
      )}
      <p className={cn("mt-auto pt-4 text-[12px]", critical ? "text-snow/60" : "text-subtle")}>
        Risk score, not a probability. Review the evidence below before acting.
      </p>
    </div>
  );
}
