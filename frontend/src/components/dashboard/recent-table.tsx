"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, Inbox } from "lucide-react";
import { useInvestigations } from "@/hooks/use-investigations";
import { timeAgo, verdict } from "@/lib/derive";
import { RiskTag } from "./risk-tag";

export function RecentTable({ limit = 8, title = "Recent investigations" }: { limit?: number; title?: string }) {
  const items = useInvestigations();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em]">{title}</h2>
        {items && items.length > limit && (
          <Link href="/dashboard" className="text-[13px] font-medium text-sapphire hover:underline">
            View all
          </Link>
        )}
      </div>

      {items === null ? (
        <div className="h-24 border-t border-line" />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border-t border-line px-6 py-12 text-center">
          <Inbox className="size-6 text-subtle" />
          <p className="text-[14px] font-medium">No investigations yet</p>
          <p className="text-[13px] text-muted">Upload an .eml file or pick a sample to get started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {items.slice(0, limit).map((it) => {
            const v = verdict(it.result);
            const e = it.result.email;
            return (
              <li key={it.id}>
                <Link
                  href={`/investigate/${it.id}`}
                  className="group grid grid-cols-[minmax(0,1fr)_16px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-fg/[0.03] active:bg-fg/[0.05] sm:grid-cols-[120px_1fr_auto] sm:gap-4 sm:px-6 sm:py-4 md:grid-cols-[120px_1.2fr_1fr_90px_24px]"
                >
                  <RiskTag level={v.level} score={v.score} className="hidden sm:inline-flex" />
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-medium sm:text-[14px]">{e.subject || "(no subject)"}</p>
                    <p className="truncate font-mono text-[12px] text-muted sm:hidden">{e.from ?? "unknown sender"}</p>
                    <p className="hidden truncate font-mono text-[12px] text-muted sm:block">{it.result.filename}</p>
                    <div className="mt-1.5 flex items-center gap-2 sm:hidden">
                      <RiskTag level={v.level} score={v.score} />
                      <span className="text-[12px] text-muted">{timeAgo(it.savedAt)}</span>
                    </div>
                  </div>
                  <p className="hidden truncate font-mono text-[12.5px] text-muted md:block">{e.from ?? "unknown sender"}</p>
                  <p className="hidden text-right text-[12.5px] text-muted sm:block md:text-left">{timeAgo(it.savedAt)}</p>
                  <ArrowUpRight className="hidden size-4 text-muted transition group-hover:text-fg md:block" />
                  <ChevronRight className="size-4 text-subtle sm:hidden" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
