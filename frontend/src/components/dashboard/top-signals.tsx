import SpotlightCard from "@/components/reactbits/SpotlightCard";
import type { Severity } from "@/lib/types";
import { severityStyle } from "./risk";

export function TopSignals({ signals }: { signals: { label: string; count: number; severity: Severity }[] }) {
  const max = Math.max(1, ...signals.map((s) => s.count));
  return (
    <SpotlightCard spotlightColor="rgb(213 160 33 / 0.14)" className="rounded-2xl border border-line bg-panel p-6">
      <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Most frequent findings</h2>
      {signals.length === 0 ? (
        <p className="mt-5 text-[14px] text-muted">No technical findings yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {signals.map((s) => (
            <li key={s.label}>
              <div className="flex items-center justify-between gap-3 text-[13.5px]">
                <span className="truncate">{s.label}</span>
                <span className="font-mono text-[12.5px] text-muted">{s.count}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fg/[0.06]">
                <div className={`h-full rounded-full ${severityStyle[s.severity].dot}`} style={{ width: `${(s.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SpotlightCard>
  );
}
