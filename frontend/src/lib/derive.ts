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
  scored: boolean; // true when the backend risk engine produced the score
}

function levelFromObservations(obs: Observation[]): RiskLevel {
  const max = Math.max(0, ...obs.map((o) => SEVERITY_RANK[o.severity] ?? 0));
  return max >= 4 ? "critical" : max === 3 ? "high" : max === 2 ? "medium" : "low";
}

export function verdict(r: InvestigateResponse): Verdict {
  const ra = r.investigation.risk_assessment;
  const ai = aiVerdict(r);
  return {
    level: ra?.risk_level ?? ai?.risk_level ?? levelFromObservations(r.investigation.observations),
    score: typeof ra?.score === "number" ? Math.round(ra.score) : null,
    confidence: ra?.confidence ?? ai?.confidence ?? null,
    summary: ai?.summary ?? null,
    actions: ai?.recommended_actions ?? [],
    scored: typeof ra?.score === "number",
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

export function relayPath(r: InvestigateResponse): { servers: RelayServer[]; links: RelayLink[] } {
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
