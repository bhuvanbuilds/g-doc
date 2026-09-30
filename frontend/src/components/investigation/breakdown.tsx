import { Bot, Cpu } from "lucide-react";
import { severityStyle } from "@/components/dashboard/risk";
import { contributions, verdict, type Contribution } from "@/lib/derive";
import type { InvestigateResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Empty, Panel, Section } from "./section";

function Column({ title, icon, items, max }: { title: string; icon: React.ReactNode; items: Contribution[]; max: number }) {
  const total = items.reduce((n, c) => n + (c.points ?? 0), 0);
  const scored = items.some((c) => c.points !== null);
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold">
          {icon}
          {title}
        </h3>
        {scored && <span className="font-mono text-[13px] font-semibold">+{total} pts</span>}
      </div>
      {items.length === 0 ? (
        <Empty>Nothing contributed from this source.</Empty>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {items.map((c, i) => (
            <li key={i} className="px-5 py-3.5">
              <div className="flex items-start gap-3">
                <p className="flex-1 text-[14px] leading-snug">
                  {c.label}
                  {c.detail && <span className="mt-0.5 block text-[12.5px] text-muted">{c.detail}</span>}
                </p>
                {c.points !== null ? (
                  <span className="font-mono text-[13px] font-semibold">+{c.points}</span>
                ) : c.severity ? (
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[11.5px] font-semibold", severityStyle[c.severity].badge)}>
                    {severityStyle[c.severity].label}
                  </span>
                ) : null}
              </div>
              {c.points !== null && max > 0 && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fg/[0.06]">
                  <div
                    className={cn("h-full rounded-full", c.source === "ai" ? "bg-sapphire" : "bg-fg")}
                    style={{ width: `${(c.points / max) * 100}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function BreakdownSection({ r }: { r: InvestigateResponse }) {
  const v = verdict(r);
  const all = contributions(r);
  const max = Math.max(0, ...all.map((c) => c.points ?? 0));

  return (
    <Section
      id="breakdown"
      title="Score breakdown"
      description={
        v.scored
          ? `How ${v.score}/100 was reached. Every reason and the points it added.`
          : "The backend hasn't returned a scored breakdown yet, so findings are ranked by severity."
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Column title="Technical evidence" icon={<Cpu className="size-4" />} items={all.filter((c) => c.source === "technical")} max={max} />
        <Column title="AI analysis" icon={<Bot className="size-4 text-sapphire" />} items={all.filter((c) => c.source === "ai")} max={max} />
      </div>
    </Section>
  );
}
