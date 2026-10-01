"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { useInvestigations } from "@/hooks/use-investigations";
import { cn } from "@/lib/utils";
import { AiFindingsSection } from "./ai-findings";
import { BreakdownSection } from "./breakdown";
import { EmailDetailsSection } from "./email-details";
import { EvidenceSection } from "./evidence";
import { exportInvestigation, Overview } from "./overview";
import { isTyping } from "@/components/shortcuts";
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

  useEffect(() => {
    if (!item) return;
    const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return;
      const k = e.key.toLowerCase();
      const idx = NAV.findIndex((n) => n.id === active);
      if (k === "j") go(NAV[Math.min(NAV.length - 1, idx + 1)].id);
      else if (k === "k") go(NAV[Math.max(0, idx - 1)].id);
      else if (/^[1-7]$/.test(k)) go(NAV[Number(k) - 1].id);
      else if (k === "e") exportInvestigation(item);
      else if (k === "p") window.print();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, active]);

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
      <MobileSectionNav active={active} />

      <div className="grid gap-8 pt-2 lg:grid-cols-[180px_minmax(0,1fr)] lg:border-t lg:border-line lg:pt-10">
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
                  <span className="flex items-center justify-between">
                    {n.label}
                    <span className={cn("font-mono text-[11px]", active === n.id ? "text-snow/60" : "text-subtle")}>{NAV.indexOf(n) + 1}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-12 sm:space-y-14">
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

// Phones: the sidebar is hidden, so sections get a sticky, swipeable chip row under the top bar.
function MobileSectionNav({ active }: { active: string }) {
  const row = useRef<HTMLUListElement>(null);

  // Keep the active chip in view. Scrolls the row only, never the page,
  // so it can't interrupt a smooth scroll to a section.
  useEffect(() => {
    const ul = row.current;
    const chip = ul?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!ul || !chip) return;
    ul.scrollTo({ left: chip.offsetLeft - (ul.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Sections" className="sticky top-14 z-30 -mx-4 mb-6 border-b border-line bg-bg/95 sm:top-16 lg:hidden print:hidden">
      <ul ref={row} className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5">
        {NAV.map((n) => (
          <li key={n.id} data-id={n.id} className="shrink-0">
            <a
              href={`#${n.id}`}
              className={cn(
                "tap-press block rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                active === n.id ? "bg-fg text-snow" : "border border-line bg-panel text-muted"
              )}
            >
              {n.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
