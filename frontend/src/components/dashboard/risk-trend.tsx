"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StoredInvestigation } from "@/lib/history";
import { verdict } from "@/lib/derive";
import type { RiskLevel } from "@/lib/types";
import { riskStyle } from "./risk";

const series: RiskLevel[] = ["low", "medium", "high", "critical"];

function lastSevenDays(items: StoredInvestigation[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return { key: d.toDateString(), day: d.toLocaleDateString("en-US", { weekday: "short" }), low: 0, medium: 0, high: 0, critical: 0 };
  });
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const it of items) {
    const bucket = byKey.get(new Date(it.savedAt).toDateString());
    if (bucket) bucket[verdict(it.result).level] += 1;
  }
  return days;
}

export function RiskTrend({ items }: { items: StoredInvestigation[] }) {
  const data = lastSevenDays(items);
  return (
    <div className="rounded-2xl border border-line bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Investigations, last 7 days</h2>
        <div className="flex gap-4">
          {[...series].reverse().map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-[12.5px] text-muted">
              <span className={`size-2 rounded-full ${riskStyle[k].dot}`} />
              {riskStyle[k].short}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#ECE7E5" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#8D919B", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8D919B", fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              cursor={{ stroke: "#D7D0CD" }}
              contentStyle={{ background: "#fff", border: "1px solid #E8E3E1", borderRadius: 10, fontSize: 13 }}
              labelStyle={{ color: "#050609", marginBottom: 4, fontWeight: 600 }}
            />
            {series.map((k) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                name={riskStyle[k].short}
                stackId="1"
                stroke={riskStyle[k].hex}
                strokeWidth={1.5}
                fill={riskStyle[k].hex}
                fillOpacity={0.18}
                animationDuration={900}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
