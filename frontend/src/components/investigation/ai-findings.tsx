import { Bot, CircleCheck, TriangleAlert } from "lucide-react";
import { friendlyAiError, humanize, SEVERITY_RANK } from "@/lib/derive";
import type { InvestigateResponse } from "@/lib/types";
import { RiskTag } from "@/components/dashboard/risk-tag";
import { Empty, Panel, Section } from "./section";

export function AiFindingsSection({ r }: { r: InvestigateResponse }) {
  const ai = r.investigation.ai_analysis;

  return (
    <Section id="ai" title="AI findings" description="Language and social-engineering signals, interpreted from the email and the evidence above.">
      {ai?.status !== "success" ? (
        <Panel className="flex items-start gap-3 p-5">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-med-fg" />
          <div>
            <p className="text-[14px] font-semibold">AI analysis unavailable</p>
            <p className="mt-1 text-[13.5px] text-muted">
              {friendlyAiError(r) ?? "The AI service did not return a result."} The score and technical evidence are unaffected.
            </p>
            {ai?.status === "error" && ai.error && (
              <details className="mt-2 text-[12.5px]">
                <summary className="cursor-pointer text-muted">Technical details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-[11.5px] text-fg/70">{ai.error}</pre>
              </details>
            )}
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              <h3 className="flex items-center gap-2 text-[15px] font-semibold">
                <Bot className="size-4 text-sapphire" /> Signals
              </h3>
              <span className="text-[13px] text-muted">AI rates it</span>
              <RiskTag level={ai.analysis.risk_level} />
              <span className="ml-auto font-mono text-[12px] text-muted">
                {ai.model ?? ai.provider} · {Math.round(ai.analysis.confidence * 100)}% confidence
              </span>
            </div>
            {ai.analysis.signals.length === 0 ? (
              <Empty>No social-engineering signals detected.</Empty>
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {[...ai.analysis.signals]
                  .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])
                  .map((s, i) => (
                    <li key={i} className="flex items-start gap-4 px-5 py-4">
                      <RiskTag level={s.severity} className="mt-0.5 w-[84px] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold">{humanize(s.type)}</p>
                        <p className="mt-0.5 text-[13.5px] leading-relaxed text-fg/80">{s.description}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-5">
            <h3 className="text-[15px] font-semibold">Recommended actions</h3>
            {ai.analysis.recommended_actions.length === 0 ? (
              <p className="mt-3 text-[14px] text-muted">None.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {ai.analysis.recommended_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] leading-snug">
                    <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-sapphire" />
                    {a}
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-5 border-t border-line pt-4 text-[12.5px] leading-relaxed text-muted">
              AI output is advisory. It is instructed to rely only on the supplied evidence and never to assume an email is malicious.
            </p>
          </Panel>
        </div>
      )}
    </Section>
  );
}
