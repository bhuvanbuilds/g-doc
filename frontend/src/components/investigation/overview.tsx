"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Bot, CircleCheck, Download, FileSearch, Plus, Printer } from "lucide-react";
import BlurText from "@/components/reactbits/BlurText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { checkStyle, riskStyle } from "@/components/dashboard/risk";
import { RiskTag } from "@/components/dashboard/risk-tag";
import { checks, topReasons, verdict, type Check } from "@/lib/derive";
import type { StoredInvestigation } from "@/lib/history";
import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RiskGauge, scoreColor } from "./risk-gauge";

const CHECK_GLOW = {
  pass: "rgb(47 163 107 / 0.16)",
  warn: "rgb(213 160 33 / 0.18)",
  fail: "rgb(163 22 33 / 0.16)",
  none: "rgb(5 6 9 / 0.06)",
} as const;

export function exportInvestigation(item: StoredInvestigation) {
  const r = item.result;
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${r.filename.replace(/\.eml$/i, "")}-investigation.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function Overview({ item }: { item: StoredInvestigation }) {
  const r = item.result;
  const v = verdict(r);
  const reasons = topReasons(r, 3);
  const quick = checks(r);
  const e = r.email;
  const maxPts = Math.max(1, ...reasons.map((c) => c.points ?? 0));

  return (
    <section id="overview" className="flex min-h-[calc(100svh-64px)] flex-col gap-4 pb-5 pt-5">
      {/* identity */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[12.5px] text-muted">
            <FileSearch className="size-3.5" />
            {r.filename}
          </p>
          <BlurText
            as="h1"
            text={e.subject || "(no subject)"}
            className="mt-1 line-clamp-1 text-[26px] font-semibold tracking-[-0.03em] sm:text-[30px]"
            stagger={0.03}
          />
          <p className="mt-1 truncate text-[14px] text-muted">
            <span className="text-fg">{e.from ?? "Unknown sender"}</span>
            {e.to && <> → {e.to}</>}
            {e.date && <> · {e.date}</>}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 print:hidden">
          <button
            onClick={() => exportInvestigation(item)}
            title="Export JSON (E)"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-[13px] font-medium hover:bg-fg/[0.03]"
          >
            <Download className="size-4" /> JSON
          </button>
          <button
            onClick={() => window.print()}
            title="Print report (P)"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-[13px] font-medium hover:bg-fg/[0.03]"
          >
            <Printer className="size-4" /> Report
          </button>
          <Link
            href="/home"
            title="New investigation (H)"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-fg px-3 text-[13px] font-medium text-snow hover:bg-fg/85"
          >
            <Plus className="size-4" /> New
          </Link>
        </div>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <GaugeCard level={v.level} score={v.score} confidence={v.confidence} />

        <div className="grid gap-4 lg:grid-rows-[auto_1fr_auto]">
          {/* summary */}
          <SpotlightCard spotlightColor="rgb(38 103 255 / 0.12)" className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                {v.source === "ai" && <Bot className="size-3.5 text-sapphire" />}
                {v.source === "ai" ? "AI summary" : "Summary from evidence"}
              </h2>
              <RiskTag level={v.level} score={v.score} />
            </div>
            {v.summary && <BlurText as="p" text={v.summary} className="mt-3 text-[15px] leading-relaxed text-fg/85" stagger={0.012} />}
            {v.aiError && <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-[12.5px] text-med-fg">AI analysis unavailable: {v.aiError}</p>}
          </SpotlightCard>

          {/* why */}
          <SpotlightCard spotlightColor="rgb(163 22 33 / 0.1)" className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Why this verdict</h2>
            {reasons.length === 0 ? (
              <p className="mt-3 text-[14px] text-muted">No risk indicators were found in this email.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {reasons.map((c, i) => (
                  <li key={i}>
                    <div className="flex items-start gap-3">
                      <span className="mt-px font-mono text-[13px] font-semibold text-subtle">0{i + 1}</span>
                      <p className="flex-1 text-[15px] leading-snug">{c.label}</p>
                      {c.points !== null ? (
                        <span className="font-mono text-[13px] font-semibold text-high-fg">+{c.points}</span>
                      ) : c.severity ? (
                        <RiskTag level={c.severity} />
                      ) : null}
                    </div>
                    {c.points !== null && (
                      <div className="ml-8 mt-1.5 h-1 overflow-hidden rounded-full bg-fg/[0.06]">
                        <div
                          className="h-full origin-left rounded-full bg-ruby [animation:grow-x_900ms_cubic-bezier(.2,.8,.2,1)_both]"
                          style={{ width: `${(c.points / maxPts) * 100}%`, animationDelay: `${300 + i * 120}ms` }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </SpotlightCard>

          {/* what to do */}
          <SpotlightCard spotlightColor="rgb(213 160 33 / 0.14)" className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">What to do</h2>
              {v.actionsSource === "evidence" && <span className="text-[12px] text-subtle">Suggested from evidence</span>}
            </div>
            <ul className="mt-3 space-y-2">
              {v.actions.slice(0, 3).map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-snug">
                  <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-sapphire" />
                  {a}
                </li>
              ))}
            </ul>
          </SpotlightCard>
        </div>
      </div>

      {/* quick checks */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {quick.map((c) => (
          <QuickCheck key={c.id} check={c} />
        ))}
      </div>

      <a href="#evidence" className="mx-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-fg print:hidden">
        Full evidence below <ArrowDown className="size-3.5 animate-bounce" />
      </a>
    </section>
  );
}

function QuickCheck({ check }: { check: Check }) {
  const s = checkStyle[check.status];
  return (
    <SpotlightCard spotlightColor={CHECK_GLOW[check.status]} className="rounded-xl border border-line bg-panel">
      <a href={`#${check.anchor}`} className="group block p-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-muted">{check.label}</p>
          <ArrowUpRight className="size-3.5 text-subtle opacity-0 transition group-hover:opacity-100" />
        </div>
        <p className={cn("mt-2 flex items-center gap-2 text-[15px] font-semibold", s.text)}>
          <span className={cn("size-2 rounded-full", s.dot)} />
          {s.label}
        </p>
        <p className="mt-1 truncate text-[12.5px] text-muted" title={check.value}>
          {check.value}
        </p>
      </a>
    </SpotlightCard>
  );
}

function GaugeCard({ level, score, confidence }: { level: RiskLevel; score: number | null; confidence: number | null }) {
  const s = riskStyle[level];
  const tone = score !== null ? scoreColor(score) : "#8A8F9A";
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl bg-black px-6 pb-6 pt-5 text-snow">
      <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgb(252_247_248/0.07)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div
        aria-hidden
        className="absolute left-1/2 top-[42%] size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[90px]"
        style={{ background: tone }}
      />

      <div className="relative flex w-full items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-snow/60">Verdict</p>
        {level === "critical" && (
          <span className="flex items-center gap-2 rounded-full bg-ruby px-2.5 py-1 text-[12px] font-semibold">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-snow" />
              <span className="relative size-2 rounded-full bg-snow" />
            </span>
            Act now
          </span>
        )}
      </div>

      <div className="relative -mt-2 flex w-full justify-center">
        <RiskGauge score={score} />
      </div>

      <div className="relative mt-1 flex w-full flex-col items-center gap-3">
        <div style={{ color: tone }}>
          <BlurText as="p" text={s.label} delay={1.6} className="text-[34px] font-bold leading-none tracking-[-0.035em] sm:text-[40px]" />
        </div>
        {confidence !== null && (
          <div className="w-[240px] max-w-full">
            <div className="flex justify-between text-[12.5px] text-snow/60">
              <span>Confidence</span>
              <span className="font-mono">{Math.round(confidence * 100)}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-snow/10">
              <div
                className="h-full origin-left rounded-full bg-snow [animation:grow-x_1200ms_cubic-bezier(.2,.8,.2,1)_both]"
                style={{ width: `${Math.round(confidence * 100)}%`, animationDelay: "1.4s" }}
              />
            </div>
          </div>
        )}
        <p className="text-[11.5px] text-snow/40">Risk score, not a probability.</p>
      </div>
    </div>
  );
}
