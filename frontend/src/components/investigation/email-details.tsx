"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { InvestigateResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel, Section } from "./section";

// Locked-down preview: no scripts (sandbox), no network (CSP), links inert.
function safeHtml(html: string) {
  return `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">
<style>body{font:14px/1.6 system-ui,sans-serif;color:#050609;margin:16px;word-wrap:break-word}a{pointer-events:none;color:#2667FF}img{max-width:100%}</style>
</head><body>${html}</body></html>`;
}

function highlightUrls(text: string) {
  const parts = text.split(/(https?:\/\/[^\s<>'"]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <span key={i} className="rounded bg-sapphire/10 px-0.5 text-sapphire">
        {p}
      </span>
    ) : (
      p
    )
  );
}

export function EmailDetailsSection({ r }: { r: InvestigateResponse }) {
  const e = r.email;
  const hasHtml = Boolean(e.body_html?.trim());
  const [tab, setTab] = useState<"text" | "html">(e.body_text?.trim() || !hasHtml ? "text" : "html");

  const fields: [string, string | null][] = [
    ["From", e.from],
    ["To", e.to],
    ["Cc", e.cc],
    ["Reply-To", e.reply_to],
    ["Return-Path", e.return_path],
    ["Subject", e.subject],
    ["Date", e.date],
    ["Message-ID", e.message_id],
  ];

  return (
    <Section id="email" title="Email" description="The message as received, including headers and body.">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel className="overflow-hidden">
          <h3 className="px-4 py-4 text-[15px] font-semibold sm:px-5">Headers</h3>
          <dl className="divide-y divide-line border-t border-line text-[13px]">
            {fields.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 px-4 py-2.5 sm:grid-cols-[110px_1fr] sm:px-5">
                <dt className="text-muted">{k}</dt>
                <dd className="min-w-0 break-all font-mono text-[12.5px]">{v ?? <span className="text-subtle">–</span>}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-1 px-4 py-3 sm:px-5">
            <h3 className="mr-auto text-[15px] font-semibold">Body</h3>
            {(["text", "html"] as const).map((t) => (
              <button
                key={t}
                disabled={t === "html" && !hasHtml}
                onClick={() => setTab(t)}
                className={cn(
                  "tap-press rounded-md px-2.5 py-1.5 text-[12.5px] font-medium disabled:opacity-40 sm:py-1",
                  tab === t ? "bg-fg text-snow" : "text-muted hover:bg-fg/5"
                )}
              >
                {t === "text" ? "Plain text" : "HTML preview"}
              </button>
            ))}
          </div>
          <div className="border-t border-line">
            {tab === "text" ? (
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-[12.5px] leading-relaxed sm:px-5">
                {e.body_text?.trim() ? highlightUrls(e.body_text) : <span className="text-subtle">No plain-text body.</span>}
              </pre>
            ) : (
              <>
                <p className="flex items-center gap-1.5 bg-low/[0.06] px-5 py-2 text-[12px] text-low-fg">
                  <ShieldCheck className="size-3.5" /> Safe preview: scripts, remote images and links are blocked.
                </p>
                <iframe title="Email HTML preview" sandbox="" srcDoc={safeHtml(e.body_html)} className="h-[360px] w-full bg-white sm:h-[420px]" />
              </>
            )}
          </div>
        </Panel>
      </div>

      {e.received.length > 0 && (
        <details className="mt-4 rounded-xl border border-line bg-panel px-5 py-3 text-[13px]">
          <summary className="cursor-pointer font-medium text-muted">Raw Received headers ({e.received.length})</summary>
          <ol className="mt-3 space-y-3">
            {e.received.map((h, i) => (
              <li key={i} className="whitespace-pre-wrap break-all font-mono text-[12px] text-fg/80">
                <span className="mr-2 text-subtle">#{i + 1}</span>
                {h}
              </li>
            ))}
          </ol>
        </details>
      )}
    </Section>
  );
}
