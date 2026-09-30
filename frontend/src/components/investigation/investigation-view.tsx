"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { useInvestigations } from "@/hooks/use-investigations";
import { cn } from "@/lib/utils";
import { AiFindingsSection } from "./ai-findings";
import { BreakdownSection } from "./breakdown";
import { EmailDetailsSection } from "./email-details";
import { EvidenceSection } from "./evidence";
import { Overview } from "./overview";
import { RelaySection } from "./relay-map";
import { Panel, Section } from "./section";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "evidence", label: "Evidence" },
  { id: "breakdown", label: "Score breakdown" },
  { id: "ai", label: "AI findings" },
  { id: "relay", label: "Relay path" },
  { id: "email", label: "Email" },
  { id: "raw", label: "Raw data" },
];

function useActiveSection(ready: boolean) {
  const [active, setActive] = useState("overview");
  useEffect(() => {
    if (!ready) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ready]);
  return active;
}

export function InvestigationView({ id }: { id: string }) {
  const items = useInvestigations();
  const item = items?.find((i) => i.id === id);
  const active = useActiveSection(Boolean(item));

  if (items === null) return <div className="min-h-[60vh]" />;

  if (!item) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <FileQuestion className="size-8 text-subtle" />
        <h1 className="text-[20px] font-semibold">Investigation not found</h1>
        <p className="max-w-[420px] text-[14px] text-muted">
          Results are kept in this browser only. It may have been cleared, or opened on another device.
        </p>
        <Link href="/home" className="mt-2 rounded-lg bg-fg px-4 py-2 text-[14px] font-medium text-snow">
          Investigate an email
        </Link>
      </div>
    );
  }

  const r = item.result;

  return (
    <>
      <Overview item={item} />

      <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav className="hidden lg:block print:hidden">
          <ul className="sticky top-24 space-y-0.5">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className={cn(
                    "block rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors",
                    active === n.id ? "bg-fg text-snow" : "text-muted hover:bg-fg/5 hover:text-fg"
                  )}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-14">
          <EvidenceSection r={r} />
          <BreakdownSection r={r} />
          <AiFindingsSection r={r} />
          <RelaySection r={r} />
          <EmailDetailsSection r={r} />
          <Section id="raw" title="Raw data" description="The complete API response, for analysts and for debugging.">
            <Panel>
              <details className="px-5 py-3">
                <summary className="cursor-pointer text-[13px] font-medium text-muted">Show JSON</summary>
                <pre className="mt-3 max-h-[520px] overflow-auto font-mono text-[12px] leading-relaxed">{JSON.stringify(r, null, 2)}</pre>
              </details>
            </Panel>
          </Section>
        </div>
      </div>
    </>
  );
}
