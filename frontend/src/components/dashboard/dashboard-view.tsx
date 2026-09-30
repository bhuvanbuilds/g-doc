"use client";

import Link from "next/link";
import { BarChart3, Trash2 } from "lucide-react";
import BlurText from "@/components/reactbits/BlurText";
import CountUp from "@/components/reactbits/CountUp";
import HoldButton from "@/components/reactbits/HoldButton";
import ShinyText from "@/components/reactbits/ShinyText";
import { clearInvestigations } from "@/lib/history";
import { timeAgo } from "@/lib/derive";
import { useInvestigations } from "@/hooks/use-investigations";
import { aggregate } from "@/lib/derive";
import { KpiTiles } from "./kpi-tiles";
import { RecentTable } from "./recent-table";
import { RiskDonut } from "./risk-donut";
import { RiskTrend } from "./risk-trend";
import { TopSignals } from "./top-signals";

export function DashboardView() {
  const items = useInvestigations();
  if (items === null) return <div className="min-h-[60vh]" />;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <BarChart3 className="size-8 text-subtle" />
        <h1 className="text-[20px] font-semibold">Nothing to chart yet</h1>
        <p className="max-w-[420px] text-[14px] text-muted">
          The dashboard summarises the investigations you run. Analyse an email or a sample to see it fill up.
        </p>
        <Link href="/home" className="mt-2 rounded-lg bg-fg px-4 py-2 text-[14px] font-medium text-snow">
          Investigate an email
        </Link>
      </div>
    );
  }

  const a = aggregate(items);
  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-3xl bg-black p-6 text-snow sm:p-8 lg:p-10">
        <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgb(252_247_248/0.07)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[13px] font-medium text-snow/70">
              <ShinyText text="Dashboard" />
            </p>
            <BlurText as="h1" text="Your investigations" className="mt-1 text-[34px] font-semibold tracking-[-0.035em] sm:text-[44px]" />
            <p className="mt-2 text-[14px] text-snow/60">
              Last analysed {timeAgo(items[0].savedAt)} · stored in this browser only
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
            <Stat label="Investigated" value={a.total} />
            <Stat label="Need attention" value={a.levels.high + a.levels.critical} tone="text-[#ec5a63]" />
            <Stat label="Likely safe" value={a.levels.low} tone="text-[#3fcf8e]" />
            <HoldButton
              onConfirm={clearInvestigations}
              className="flex h-10 items-center gap-2 rounded-full border border-snow/20 px-4 text-[13px] font-medium text-snow/80 hover:border-snow/40"
            >
              <Trash2 className="size-3.5" /> Hold to clear history
            </HoldButton>
          </div>
        </div>
      </header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <RiskDonut levels={a.levels} />
        <KpiTiles avgScore={a.avgScore} authFailPct={a.authFailPct} domains={a.domains} riskyAttachments={a.riskyAttachments} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <RiskTrend items={items} />
        <TopSignals signals={a.topSignals} />
      </div>
      <RecentTable limit={40} title="All investigations" />
    </div>
  );
}

function Stat({ label, value, tone = "text-snow" }: { label: string; value: number; tone?: string }) {
  return (
    <div>
      <p className={`text-[48px] font-bold leading-none tracking-[-0.045em] tabular-nums ${tone}`}>
        <CountUp to={value} />
      </p>
      <p className="mt-2 text-[13px] text-snow/60">{label}</p>
    </div>
  );
}
