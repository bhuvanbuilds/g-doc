import { Bot, Cpu } from "lucide-react";
import { aiVerdict, contributions, friendlyAiError, humanize, verdict, type Contribution } from "@/lib/derive";
import type { InvestigateResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RiskTag } from "@/components/dashboard/risk-tag";
import { Empty, Panel, Section } from "./section";

function Column({
  title,
  icon,
  items,
  max,
  empty = "Nothing contributed from this source.",
  footer,
}: {
  title: string;
  icon: React.ReactNode;
  items: Contribution[];
  max: number;
  empty?: React.ReactNode;
  footer?: React.ReactNode;
}) {
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
        <Empty>{empty}</Empty>
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
                  <RiskTag level={c.severity} />
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
      {footer}
    </Panel>
  );
}

const norm = (x: string) => x.trim().toLowerCase().replace(/[\s-]+/g, "_");

// Explains an empty or partial AI column: the AI failed, or its signals aren't in the score rules.
function aiNotes(r: InvestigateResponse, scoredAi: Contribution[]) {
  const ai = aiVerdict(r);
  if (!ai) {
    return {
      empty: (
        <>
          AI analysis didn&apos;t run, so it added no points.
          <span className="mt-1 block text-[12.5px]">{friendlyAiError(r) ?? "The AI service didn't return a result."}</span>
        </>
      ),
      unscored: [] as { type: string; description: string }[],
    };
  }
  const scoredTypes = new Set(
    (r.investigation.risk_assessment?.breakdown ?? []).filter((b) => b.source === "ai" && b.signal).map((b) => norm(b.signal!))
  );
  const unscored = r.investigation.risk_assessment?.breakdown?.length
    ? ai.signals.filter((s) => !scoredTypes.has(norm(s.type)))
    : [];
  return {
    empty: ai.signals.length
      ? "The AI found signals, but none match the score engine's rules, so they added no points."
      : "The AI found no social-engineering signals.",
    unscored: scoredAi.length || ai.signals.length ? unscored : [],
  };
}

export function BreakdownSection({ r }: { r: InvestigateResponse }) {
  const v = verdict(r);
  const all = contributions(r);
  const max = Math.max(0, ...all.map((c) => c.points ?? 0));
  const aiItems = all.filter((c) => c.source === "ai");
  const notes = aiNotes(r, aiItems);

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
        <Column
          title="AI analysis"
          icon={<Bot className="size-4 text-sapphire" />}
          items={aiItems}
          max={max}
          empty={notes.empty}
          footer={
            notes.unscored.length > 0 && (
              <div className="border-t border-line bg-fg/[0.02] px-5 py-3.5">
                <p className="text-[12.5px] font-medium text-muted">
                  Also found by the AI, not scored (no matching score rule):
                </p>
                <ul className="mt-2 space-y-1.5">
                  {notes.unscored.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px]">
                      <span className="font-mono text-[12px] text-subtle">0</span>
                      <span>
                        <span className="font-medium">{humanize(s.type)}</span>
                        <span className="text-muted"> · {s.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }
        />
      </div>
    </Section>
  );
}
