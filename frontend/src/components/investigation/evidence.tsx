import { AlertTriangle, ExternalLink, Paperclip } from "lucide-react";
import { checkStyle } from "@/components/dashboard/risk";
import { authStatus, formatBytes, vtCounts, type CheckStatus } from "@/lib/derive";
import type { InvestigateResponse, VirusTotalResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Empty, Panel, Section } from "./section";

function StatusTag({ status, label }: { status: CheckStatus; label?: string }) {
  const s = checkStyle[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-semibold", s.ring, s.text)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {label ?? s.label}
    </span>
  );
}

function EvidenceCard({
  title,
  status,
  statusLabel,
  value,
  rows,
  note,
}: {
  title: string;
  status: CheckStatus;
  statusLabel?: string;
  value: string | null;
  rows?: [string, string | null][];
  note?: string;
}) {
  return (
    <Panel className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold">{title}</h3>
        <StatusTag status={status} label={statusLabel} />
      </div>
      <p className="mt-3 break-all font-mono text-[13px] text-fg">{value ?? <span className="text-subtle">not present</span>}</p>
      {rows && (
        <dl className="mt-3 space-y-1 text-[12.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="w-24 shrink-0 text-muted">{k}</dt>
              <dd className="min-w-0 break-all font-mono">{v ?? "–"}</dd>
            </div>
          ))}
        </dl>
      )}
      {note && (
        <p className="mt-auto flex items-start gap-1.5 pt-3 text-[12.5px] text-muted">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-med-fg" />
          {note}
        </p>
      )}
    </Panel>
  );
}

const AUTH_INFO = {
  spf: "Is the sending server allowed to send for this domain?",
  dkim: "Was the message signed by the domain and left unmodified?",
  dmarc: "Do SPF/DKIM align with the visible From domain?",
};

function vtLabel(v: VirusTotalResult | undefined): { status: CheckStatus; text: string } {
  if (!v) return { status: "none", text: "Not checked" };
  if (v.status === "found") {
    const c = vtCounts(v)!;
    if (c.malicious) return { status: "fail", text: `${c.malicious} malicious` };
    if (c.suspicious) return { status: "warn", text: `${c.suspicious} suspicious` };
    return { status: "pass", text: "Clean" };
  }
  if (v.status === "not_found") return { status: "none", text: "Unknown to VT" };
  if (v.status === "rate_limited") return { status: "none", text: "Rate limited" };
  return { status: "none", text: "Lookup failed" };
}

export function EvidenceSection({ r }: { r: InvestigateResponse }) {
  const te = r.investigation.technical_evidence;
  const h = te.headers;
  const a = te.authentication;
  const e = r.email;

  const replyObs = h.observations.find((o) => o.type === "reply_to_mismatch");
  const returnObs = h.observations.find((o) => o.type === "return_path_mismatch");
  const urlObs = (url: string) => te.urls.observations.filter((o) => o.evidence?.url === url);
  const vtFor = (url: string) => te.virustotal.find((v) => v.url === url);
  const attObs = (name: string) => te.attachments.observations.find((o) => o.evidence?.filename === name);

  return (
    <Section id="evidence" title="Evidence" description="Every technical check, with the exact value it was based on.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <EvidenceCard
          title="Sender (From)"
          status={h.sender_domain ? "pass" : "none"}
          statusLabel={h.sender_domain ? "Parsed" : "Missing"}
          value={e.from}
          rows={[["Domain", h.sender_domain]]}
        />
        <EvidenceCard
          title="Reply-To"
          status={!e.reply_to ? "none" : replyObs ? "fail" : "pass"}
          statusLabel={!e.reply_to ? "Not set" : replyObs ? "Mismatch" : "Matches"}
          value={e.reply_to}
          rows={[["Domain", h.reply_to_domain]]}
          note={replyObs ? `Replies go to ${h.reply_to_domain}, not ${h.sender_domain}.` : undefined}
        />
        <EvidenceCard
          title="Return-Path"
          status={!e.return_path ? "none" : returnObs ? "warn" : "pass"}
          statusLabel={!e.return_path ? "Not set" : returnObs ? "Differs" : "Matches"}
          value={e.return_path}
          rows={[["Domain", h.return_path_domain]]}
          note={returnObs ? "Bounces go to a different domain than the sender. Common for mailing services, but worth checking." : undefined}
        />
        {(["spf", "dkim", "dmarc"] as const).map((k) => (
          <EvidenceCard
            key={k}
            title={k.toUpperCase()}
            status={authStatus(a[k])}
            statusLabel={a[k] ?? "Not reported"}
            value={a[k] ? `${k}=${a[k]}` : null}
            note={AUTH_INFO[k]}
          />
        ))}
      </div>

      {a.raw.length > 0 && (
        <details className="mt-4 rounded-xl border border-line bg-panel px-5 py-3 text-[13px]">
          <summary className="cursor-pointer font-medium text-muted">Raw Authentication-Results</summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[12px] text-fg/80">{a.raw.join("\n\n")}</pre>
        </details>
      )}

      {/* links */}
      <Panel className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-[15px] font-semibold">Links</h3>
          <span className="text-[13px] text-muted">{te.urls.urls.length} found · checked with VirusTotal</span>
        </div>
        {te.urls.urls.length === 0 ? (
          <Empty>No links in this email.</Empty>
        ) : (
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="bg-fg/[0.02] text-[12px] text-muted">
                <tr>
                  <th className="px-5 py-2.5 font-medium">URL</th>
                  <th className="px-3 py-2.5 font-medium">Host</th>
                  <th className="px-3 py-2.5 font-medium">Issues</th>
                  <th className="px-5 py-2.5 font-medium">VirusTotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {te.urls.urls.map((u) => {
                  const issues = urlObs(u.url);
                  const vt = vtLabel(vtFor(u.url));
                  const c = vtFor(u.url)?.status === "found" ? vtCounts(vtFor(u.url)!) : null;
                  return (
                    <tr key={u.url} className="align-top">
                      <td className="max-w-[360px] px-5 py-3">
                        <span className="flex items-start gap-1.5 break-all font-mono text-[12.5px]">
                          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-subtle" />
                          {u.url}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12.5px]">
                        {u.hostname}
                        {u.port ? `:${u.port}` : ""}
                        <span className="ml-1.5 text-subtle">{u.scheme}</span>
                      </td>
                      <td className="px-3 py-3">
                        {issues.length === 0 ? (
                          <span className="text-muted">None</span>
                        ) : (
                          <ul className="space-y-1">
                            {issues.map((o) => (
                              <li key={o.type} className={o.severity === "low" ? "text-med-fg" : "text-high-fg"}>
                                {o.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <StatusTag status={vt.status} label={vt.text} />
                        {c && (
                          <p className="mt-1 font-mono text-[11.5px] text-muted">
                            {c.malicious}/{c.suspicious}/{c.harmless}/{c.undetected} mal/sus/ok/und
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* attachments */}
      <Panel className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-[15px] font-semibold">Attachments</h3>
          <span className="text-[13px] text-muted">Metadata only, files are never opened</span>
        </div>
        {te.attachments.attachments.length === 0 ? (
          <Empty>No attachments.</Empty>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {te.attachments.attachments.map((f) => {
              const bad = attObs(f.filename);
              return (
                <li key={f.filename} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                  <Paperclip className="size-4 text-subtle" />
                  <span className="font-mono text-[13px]">{f.filename}</span>
                  <span className="text-[12.5px] text-muted">{f.content_type}</span>
                  <span className="text-[12.5px] text-muted">{formatBytes(f.size)}</span>
                  <span className="ml-auto">
                    {bad ? <StatusTag status="fail" label={`Dangerous type ${f.extension}`} /> : <StatusTag status="pass" label="No known issue" />}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </Section>
  );
}
