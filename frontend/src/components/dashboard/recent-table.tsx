"use client";

import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import { useInvestigations } from "@/hooks/use-investigations";
import { timeAgo, verdict } from "@/lib/derive";
import { RiskTag } from "./risk-tag";

export function RecentTable({ limit = 8, title = "Recent investigations" }: { limit?: number; title?: string }) {
  const items = useInvestigations();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex items-center justify-between px-6 py-5">
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
                  className="group grid grid-cols-[120px_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-fg/[0.03] md:grid-cols-[120px_1.2fr_1fr_90px_24px]"
                >
                  <RiskTag level={v.level} score={v.score} />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{e.subject || "(no subject)"}</p>
                    <p className="truncate font-mono text-[12px] text-muted">{it.result.filename}</p>
                  </div>
                  <p className="hidden truncate font-mono text-[12.5px] text-muted md:block">{e.from ?? "unknown sender"}</p>
                  <p className="text-right text-[12.5px] text-muted md:text-left">{timeAgo(it.savedAt)}</p>
                  <ArrowUpRight className="hidden size-4 text-muted transition group-hover:text-fg md:block" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
