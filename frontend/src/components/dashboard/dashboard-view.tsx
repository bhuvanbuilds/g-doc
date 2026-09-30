"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
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
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] font-medium text-muted">Dashboard</p>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Your investigations</h1>
        </div>
        <p className="text-[12.5px] text-muted">Stored in this browser</p>
      </div>
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
