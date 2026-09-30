import type {
  AiVerdict,
  AuthResult,
  InvestigateResponse,
  IpInfoResult,
  Observation,
  RiskLevel,
  Severity,
  VirusTotalResult,
} from "./types";
import type { StoredInvestigation } from "./history";

export const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 4 };

export function aiVerdict(r: InvestigateResponse): AiVerdict | null {
  const ai = r.investigation.ai_analysis;
  return ai?.status === "success" ? ai.analysis : null;
}

// ─── Verdict ──────────────────────────────────────────────────────────────────
export interface Verdict {
  level: RiskLevel;
  score: number | null;
  confidence: number | null;
  summary: string | null;
  actions: string[];
  // "ai" when the AI returned them, "evidence" when derived here because it didn't.
  source: "ai" | "evidence";
  actionsSource: "ai" | "evidence";
  aiError: string | null;
  scored: boolean; // true when the backend risk engine produced the score
}

function levelFromObservations(obs: Observation[]): RiskLevel {
  const max = Math.max(0, ...obs.map((o) => SEVERITY_RANK[o.severity] ?? 0));
  return max >= 4 ? "critical" : max === 3 ? "high" : max === 2 ? "medium" : "low";
}

// Groq errors arrive as long provider strings; reduce them to something readable.
export function friendlyAiError(r: InvestigateResponse): string | null {
  const ai = r.investigation.ai_analysis;
  if (!ai || ai.status === "success") return null;
  const e = (ai.error ?? "").toLowerCase();
  if (e.includes("413") || e.includes("too large")) return "This email is too long for the AI model's request limit.";
  if (e.includes("429") || e.includes("rate limit") || e.includes("rate_limit")) return "The AI service hit its rate limit.";
  if (e.includes("not configured")) return "AI analysis isn't configured on the server.";
  if (e.includes("invalid json") || e.includes("empty response")) return "The AI returned an unreadable answer.";
  return "The AI service didn't return a result.";
}

function signalsPresent(r: InvestigateResponse): Set<string> {
  const s = new Set<string>();
  r.investigation.risk_assessment?.breakdown?.forEach((b) => b.signal && s.add(b.signal));
  r.investigation.observations.forEach((o) => s.add(o.type));
  return s;
}

function evidenceSummary(r: InvestigateResponse, level: RiskLevel, score: number | null): string {
  const reasons = (r.investigation.risk_assessment?.reasons ?? [])
    .map((x) => (typeof x === "string" ? x : x.reason ?? x.title ?? ""))
    .filter(Boolean);
  const head = score !== null ? `Scored ${score}/100 (${level} risk)` : `Rated ${level} risk`;
  if (!reasons.length) return `${head}. The technical checks found no risk indicators.`;
  // Lowercase the first word for mid-sentence use, but keep acronyms (SPF, DMARC) and names (VirusTotal).
  const list = reasons.slice(0, 3).map((x) => (/^[A-Z][a-z]+\b/.test(x) && !/^[A-Z][a-z]+[A-Z]/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x));
  const more = reasons.length > 3 ? `, plus ${reasons.length - 3} more` : "";
  return `${head} from technical evidence: ${list.join("; ")}${more}.`;
}

function evidenceActions(r: InvestigateResponse, level: RiskLevel): string[] {
  const s = signalsPresent(r);
  const has = (...keys: string[]) => keys.some((k) => [...s].some((x) => x.startsWith(k)));
  const out: string[] = [];
  if (has("virustotal_malicious", "virustotal_suspicious", "ip_based_url", "unusual_url_port"))
    out.push("Don't open the links in this email.");
  if (has("suspicious_attachment_extension")) out.push("Don't open the attachment.");
  if (has("reply_to_mismatch")) out.push("Don't reply directly. Replies go to a different domain than the sender.");
  if (has("spf_fail", "dkim_fail", "dmarc_fail", "spf_softfail", "dmarc_problem", "spf_problem"))
    out.push("Confirm the sender through a separate, known channel before acting on it.");
  if (level === "high" || level === "critical") out.push("Report the email to your security team.");
  if (!out.length) out.push("No specific action needed. Stay cautious with unexpected requests.");
  return out.slice(0, 3);
}

export function verdict(r: InvestigateResponse): Verdict {
  const ra = r.investigation.risk_assessment;
  const ai = aiVerdict(r);
  const level = ra?.risk_level ?? ai?.risk_level ?? levelFromObservations(r.investigation.observations);
  const score = typeof ra?.score === "number" ? Math.round(ra.score) : null;
  const aiUsable = Boolean(ai?.summary);
  return {
    level,
    score,
    confidence: ra?.confidence ?? ai?.confidence ?? null,
    summary: aiUsable ? ai!.summary : evidenceSummary(r, level, score),
    actions: ai?.recommended_actions?.length ? ai.recommended_actions : evidenceActions(r, level),
    source: aiUsable ? "ai" : "evidence",
    actionsSource: ai?.recommended_actions?.length ? "ai" : "evidence",
    aiError: friendlyAiError(r),
    scored: score !== null,
  };
}

// ─── Score breakdown ─────────────────────────────────────────────────────────
export interface Contribution {
  label: string;
  detail?: string;
  points: number | null;
  source: "technical" | "ai";
  severity?: Severity;
}

export function contributions(r: InvestigateResponse): Contribution[] {
  const ra = r.investigation.risk_assessment;
  if (ra?.breakdown?.length) {
    return ra.breakdown
      .map((b) => {
        const src = String(b.source ?? b.category ?? "").toLowerCase();
        return {
          label: b.reason ?? b.title ?? b.description ?? b.type ?? "Unlabelled factor",
          detail: b.reason && b.description ? b.description : undefined,
          points: b.points ?? b.score ?? b.weight ?? null,
          source: src.includes("ai") || src.includes("semantic") ? "ai" : "technical",
          severity: b.severity,
        } satisfies Contribution;
      })
      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  }

  // No risk engine output yet: list the evidence itself, unscored.
  const technical: Contribution[] = r.investigation.observations.map((o) => ({
    label: o.title,
    points: null,
    source: "technical",
    severity: o.severity,
  }));
  const ai: Contribution[] = (aiVerdict(r)?.signals ?? []).map((s) => ({
    label: s.description,
    detail: humanize(s.type),
    points: null,
    source: "ai",
    severity: s.severity,
  }));
  return [...technical, ...ai].sort(
    (a, b) => (SEVERITY_RANK[b.severity ?? "low"] ?? 0) - (SEVERITY_RANK[a.severity ?? "low"] ?? 0)
  );
}

export function topReasons(r: InvestigateResponse, n = 3): Contribution[] {
  const ra = r.investigation.risk_assessment;
  if (!ra?.breakdown?.length && ra?.reasons?.length) {
    return ra.reasons.slice(0, n).map((x) => ({
      label: typeof x === "string" ? x : x.reason ?? x.title ?? x.description ?? "",
      points: null,
      source: "technical",
    }));
  }
  return contributions(r).slice(0, n);
}

// ─── Quick checks ────────────────────────────────────────────────────────────
export type CheckStatus = "pass" | "warn" | "fail" | "none";

export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  value: string;
  anchor: string;
}

const AUTH_BAD: AuthResult[] = ["fail", "permerror"];
const AUTH_WEAK: AuthResult[] = ["softfail", "neutral", "none", "temperror"];

export function authStatus(v: AuthResult | null): CheckStatus {
  if (!v) return "none";
  if (v === "pass" || v === "bestguesspass") return "pass";
  if (AUTH_BAD.includes(v)) return "fail";
  if (AUTH_WEAK.includes(v)) return "warn";
  return "none";
}

export function vtCounts(v: VirusTotalResult) {
  if (v.status !== "found") return null;
  const s = v.last_analysis_stats ?? {};
  return {
    malicious: s.malicious ?? 0,
    suspicious: s.suspicious ?? 0,
    harmless: s.harmless ?? 0,
    undetected: s.undetected ?? 0,
  };
}

export function checks(r: InvestigateResponse): Check[] {
  const te = r.investigation.technical_evidence;
  const h = te.headers;
  const a = te.authentication;

  const replyMismatch = h.observations.some((o) => o.type === "reply_to_mismatch");
  const returnMismatch = h.observations.some((o) => o.type === "return_path_mismatch");

  const auth = [a.spf, a.dkim, a.dmarc].map(authStatus);
  const authState: CheckStatus = auth.includes("fail")
    ? "fail"
    : auth.includes("warn")
      ? "warn"
      : auth.every((s) => s === "none")
        ? "none"
        : auth.includes("none")
          ? "warn"
          : "pass";

  const urlCount = te.urls.urls.length;
  const urlIssues = te.urls.observations;
  const urlState: CheckStatus =
    urlCount === 0 ? "none" : urlIssues.some((o) => SEVERITY_RANK[o.severity] >= 2) ? "fail" : urlIssues.length ? "warn" : "pass";

  const attCount = te.attachments.attachments.length;
  const attState: CheckStatus =
    attCount === 0 ? "none" : te.attachments.observations.length ? "fail" : "pass";

  const vt = te.virustotal.map(vtCounts).filter(Boolean) as NonNullable<ReturnType<typeof vtCounts>>[];
  const malicious = vt.reduce((n, c) => n + c.malicious, 0);
  const suspicious = vt.reduce((n, c) => n + c.suspicious, 0);
  const vtState: CheckStatus =
    te.virustotal.length === 0 || vt.length === 0 ? "none" : malicious ? "fail" : suspicious ? "warn" : "pass";

  const ai = aiVerdict(r);
  const aiState: CheckStatus = !ai
    ? "none"
    : ai.risk_level === "low"
      ? "pass"
      : ai.risk_level === "medium"
        ? "warn"
        : "fail";

  return [
    {
      id: "sender",
      label: "Sender identity",
      status: replyMismatch ? "fail" : returnMismatch ? "warn" : h.sender_domain ? "pass" : "none",
      value: replyMismatch ? "Reply-To mismatch" : returnMismatch ? "Return-Path differs" : h.sender_domain ?? "Unknown",
      anchor: "evidence",
    },
    {
      id: "auth",
      label: "Authentication",
      status: authState,
      value: `SPF ${a.spf ?? "–"} · DKIM ${a.dkim ?? "–"} · DMARC ${a.dmarc ?? "–"}`,
      anchor: "evidence",
    },
    {
      id: "links",
      label: "Links",
      status: urlState,
      value: urlCount === 0 ? "No links" : `${urlCount} link${urlCount > 1 ? "s" : ""}${urlIssues.length ? `, ${urlIssues.length} issue${urlIssues.length > 1 ? "s" : ""}` : ""}`,
      anchor: "evidence",
    },
    {
      id: "attachments",
      label: "Attachments",
      status: attState,
      value: attCount === 0 ? "None" : attState === "fail" ? "Dangerous file type" : `${attCount} file${attCount > 1 ? "s" : ""}`,
      anchor: "evidence",
    },
    {
      id: "reputation",
      label: "Reputation",
      status: vtState,
      value:
        vtState === "none"
          ? "Not checked"
          : malicious
            ? `${malicious} engine${malicious > 1 ? "s" : ""} flag malicious`
            : suspicious
              ? `${suspicious} suspicious`
              : "No detections",
      anchor: "evidence",
    },
    {
      id: "ai",
      label: "AI assessment",
      status: aiState,
      value: ai ? `${capitalize(ai.risk_level)} risk` : "Unavailable",
      anchor: "ai",
    },
  ];
}

// ─── Relay path (Received headers → hops) ───────────────────────────────────
export interface RelayServer {
  host: string;
  ip: string | null;
  geo: Extract<IpInfoResult, { status: "found" }> | null;
  role: "origin" | "relay" | "recipient";
}

export interface RelayLink {
  at: string | null; // raw date string
  delaySec: number | null;
  protocol: string | null;
  gap?: boolean; // hand-off not recorded in the headers
}

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

function parseReceived(header: string) {
  const flat = header.replace(/\s+/g, " ").trim();
  const [main, date] = [flat.slice(0, flat.lastIndexOf(";")), flat.slice(flat.lastIndexOf(";") + 1).trim()];
  const from = /^from\s+(\S+)(?:\s+\(([^)]*)\))?/i.exec(main);
  const by = /\bby\s+(\S+)/i.exec(main);
  const proto = /\bwith\s+(\S+)/i.exec(main);
  const fromHost = from?.[1]?.replace(/^\[|\]$/g, "") ?? null;
  const ip = IPV4.exec(from?.[2] ?? "")?.[0] ?? IPV4.exec(from?.[1] ?? "")?.[0] ?? null;
  return {
    fromHost,
    fromIp: ip,
    byHost: by?.[1] ?? null,
    protocol: proto?.[1] ?? null,
    date: flat.includes(";") && date ? date : null,
  };
}

// Preferred: the backend's relay_path (already geolocated) + timeline timestamps.
function relayFromBackend(r: InvestigateResponse): { servers: RelayServer[]; links: RelayLink[] } | null {
  const te = r.investigation.technical_evidence;
  const path = te.relay?.relay_path;
  if (!path?.length) return null;

  const timeByHop = new Map((te.timeline?.events ?? []).map((e) => [e.hop, e.timestamp]));
  const hops = [...path].sort((a, b) => b.hop - a.hop); // header order is newest first → oldest first

  const servers: RelayServer[] = [];
  const links: RelayLink[] = [];
  let prev: number | null = null;

  let prevHop: (typeof hops)[number] | null = null;

  for (const h of hops) {
    // Gmail and others sometimes record the same hop twice.
    if (prevHop && prevHop.from_host === h.from_host && prevHop.from_ip === h.from_ip && prevHop.to_host === h.to_host) continue;
    prevHop = h;

    const geo: RelayServer["geo"] = h.geolocation ? { status: "found", ip: h.from_ip ?? "", ...h.geolocation } : null;
    const sender = h.from_host ?? h.from_ip;
    const last = servers[servers.length - 1];

    if (!last) {
      if (sender) servers.push({ host: sender, ip: h.from_ip, geo, role: "origin" });
    } else if (sender && sender !== last.host && h.from_ip !== last.ip) {
      // The sender isn't the previous receiver: a hand-off the headers don't record.
      servers.push({ host: sender, ip: h.from_ip, geo, role: "relay" });
      links.push({ at: null, delaySec: null, protocol: null, gap: true });
    } else if (!last.ip && h.from_ip) {
      last.ip = h.from_ip;
      last.geo = geo;
    }

    const at = timeByHop.get(h.hop) ?? null;
    const t = at ? Date.parse(at) : NaN;
    if (servers.length) {
      links.push({
        at,
        delaySec: prev !== null && !Number.isNaN(t) ? Math.round((t - prev) / 1000) : null,
        protocol: h.protocol,
      });
    }
    if (!Number.isNaN(t)) prev = t;
    servers.push({ host: h.to_host ?? "unknown", ip: null, geo: null, role: "relay" });
  }

  servers.forEach((s, i) => (s.role = i === 0 ? "origin" : i === servers.length - 1 ? "recipient" : "relay"));
  return { servers, links };
}

export function relayPath(r: InvestigateResponse): { servers: RelayServer[]; links: RelayLink[] } {
  const fromBackend = relayFromBackend(r);
  if (fromBackend) return fromBackend;

  const hops = [...(r.email.received ?? [])].reverse().map(parseReceived); // oldest first
  const geoByIp = new Map(
    r.investigation.technical_evidence.ipinfo
      .filter((g): g is Extract<IpInfoResult, { status: "found" }> => g.status === "found")
      .map((g) => [g.ip, g])
  );

  const servers: RelayServer[] = [];
  const links: RelayLink[] = [];
  let prevTime: number | null = null;

  hops.forEach((hop, i) => {
    if (i === 0) {
      servers.push({
        host: hop.fromHost ?? hop.fromIp ?? "unknown",
        ip: hop.fromIp,
        geo: hop.fromIp ? geoByIp.get(hop.fromIp) ?? null : null,
        role: "origin",
      });
    } else if (hop.fromIp && !servers[servers.length - 1].ip) {
      const last = servers[servers.length - 1];
      last.ip = hop.fromIp;
      last.geo = geoByIp.get(hop.fromIp) ?? null;
    }
    const t = hop.date ? Date.parse(hop.date) : NaN;
    links.push({
      at: hop.date,
      delaySec: prevTime !== null && !Number.isNaN(t) ? Math.round((t - prevTime) / 1000) : null,
      protocol: hop.protocol,
    });
    if (!Number.isNaN(t)) prevTime = t;
    servers.push({ host: hop.byHost ?? "unknown", ip: null, geo: null, role: "relay" });
  });

  if (servers.length) servers[servers.length - 1].role = "recipient";
  return { servers, links };
}

// ─── Dashboard aggregates (from browser history) ─────────────────────────────
export function aggregate(items: StoredInvestigation[]) {
  const levels: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const signalCounts = new Map<string, { label: string; count: number; severity: Severity }>();
  const domains = new Set<string>();
  let scoreSum = 0;
  let scored = 0;
  let authFail = 0;
  let riskyAttachments = 0;

  for (const it of items) {
    const v = verdict(it.result);
    levels[v.level] += 1;
    if (v.score !== null) {
      scoreSum += v.score;
      scored += 1;
    }
    const te = it.result.investigation.technical_evidence;
    if (te.headers.sender_domain) domains.add(te.headers.sender_domain);
    if ([te.authentication.spf, te.authentication.dkim, te.authentication.dmarc].some((x) => authStatus(x) === "fail"))
      authFail += 1;
    riskyAttachments += te.attachments.observations.length;
    for (const o of it.result.investigation.observations) {
      const cur = signalCounts.get(o.type) ?? { label: o.title, count: 0, severity: o.severity };
      cur.count += 1;
      signalCounts.set(o.type, cur);
    }
  }

  return {
    total: items.length,
    levels,
    avgScore: scored ? Math.round(scoreSum / scored) : null,
    authFailPct: items.length ? Math.round((authFail / items.length) * 100) : 0,
    domains: domains.size,
    riskyAttachments,
    topSignals: [...signalCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6),
  };
}

// ─── formatting ──────────────────────────────────────────────────────────────
export function humanize(s: string) {
  return capitalize(s.replace(/[_-]+/g, " "));
}

export function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
