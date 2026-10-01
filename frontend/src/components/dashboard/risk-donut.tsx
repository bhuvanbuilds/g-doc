"use client";

import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import CountUp from "@/components/reactbits/CountUp";
import type { RiskLevel } from "@/lib/types";
import { riskStyle } from "./risk";

const order: RiskLevel[] = ["critical", "high", "medium", "low"];

export function RiskDonut({ levels }: { levels: Record<RiskLevel, number> }) {
  const data = order.map((r) => ({ risk: r, name: riskStyle[r].label, value: levels[r] }));
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <SpotlightCard spotlightColor="rgb(163 22 33 / 0.1)" className="flex h-full flex-col rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Risk breakdown</h2>

      <div className="relative mx-auto mt-4 aspect-square w-full max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2.5}
              cornerRadius={6}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={900}
            >
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <Cell key={d.risk} fill={riskStyle[d.risk].hex} />
                ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E8E3E1", borderRadius: 10, fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[44px] font-bold leading-none tracking-[-0.04em] tabular-nums">
            <CountUp to={total} />
          </span>
          <span className="mt-1.5 text-[13px] text-muted">emails investigated</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {data.map((d, i) => (
          <li key={d.risk} className="flex items-center gap-3">
            <span className={`size-3 rounded-[4px] ${riskStyle[d.risk].dot}`} />
            <span className="text-[14px] font-medium">{d.name}</span>
            <span className="ml-auto text-[13px] text-muted tabular-nums">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
            <span className={`w-10 text-right text-[16px] font-semibold tabular-nums ${riskStyle[d.risk].text}`}>
              <CountUp to={d.value} delay={0.1 * i} />
            </span>
          </li>
        ))}
      </ul>
    </SpotlightCard>
  );
}
