// Types for POST /api/investigate, mirroring backend/ on the backend-development branch.
// Fields the backend may omit or is still evolving are optional.

export type Severity = "low" | "medium" | "high" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "critical";

// ─── email (parsers/email_parser.py) ──────────────────────────────────────────
export interface EmailAttachment {
  filename: string;
  content_type: string;
  size: number;
}

export interface ParsedEmail {
  from: string | null;
  to: string | null;
  cc: string | null;
  reply_to: string | null;
  return_path: string | null;
  subject: string | null;
  date: string | null;
  message_id: string | null;
  received: string[];
  authentication_results: string[];
  body_text: string;
  body_html: string;
  attachments: EmailAttachment[];
  urls: string[];
}

// ─── observations (every parser) ─────────────────────────────────────────────
export interface Observation {
  type: string;
  severity: Severity;
  title: string;
  evidence: Record<string, unknown>;
}

// ─── technical evidence (detection/evidence_engine.py) ───────────────────────
export interface HeaderAnalysis {
  sender_domain: string | null;
  reply_to_domain: string | null;
  return_path_domain: string | null;
  received_ips: string[];
  observations: Observation[];
}

export type AuthResult =
  | "pass"
  | "fail"
  | "softfail"
  | "neutral"
  | "none"
  | "temperror"
  | "permerror"
  | "bestguesspass";

export interface AuthenticationAnalysis {
  spf: AuthResult | null;
  dkim: AuthResult | null;
  dmarc: AuthResult | null;
  raw: string[];
  observations: Observation[];
}

export interface AnalyzedUrl {
  url: string;
  scheme: string;
  hostname: string | null;
  port: number | null;
  path: string;
  query: string;
  is_ip_address: boolean;
}

export interface UrlAnalysis {
  urls: AnalyzedUrl[];
  observations: Observation[];
}

export interface AnalyzedAttachment extends EmailAttachment {
  extension: string;
}

export interface AttachmentAnalysis {
  attachments: AnalyzedAttachment[];
  observations: Observation[];
}

export interface VirusTotalStats {
  harmless?: number;
  malicious?: number;
  suspicious?: number;
  undetected?: number;
  timeout?: number;
}

export type VirusTotalResult =
  | { status: "found"; url: string; reputation: number | null; last_analysis_stats: VirusTotalStats }
  | { status: "not_found" | "rate_limited"; url: string; message: string }
  | { status: "error"; url: string; error: string };

export type IpInfoResult =
  | {
      status: "found";
      ip: string;
      hostname: string | null;
      city: string | null;
      region: string | null;
      country: string | null;
      country_name: string | null;
      loc: string | null; // "lat,lng"
      org: string | null;
      timezone: string | null;
    }
  | { status: "error"; ip: string; error: string };

export interface TechnicalEvidence {
  headers: HeaderAnalysis;
  authentication: AuthenticationAnalysis;
  urls: UrlAnalysis;
  attachments: AttachmentAnalysis;
  virustotal: VirusTotalResult[];
  ipinfo: IpInfoResult[];
  observations: Observation[];
}

// ─── AI analysis (services/groq.py) ──────────────────────────────────────────
export interface AiSignal {
  type: string;
  severity: Severity;
  description: string;
}

export interface AiVerdict {
  risk_level: RiskLevel;
  confidence: number;
  summary: string;
  signals: AiSignal[];
  recommended_actions: string[];
}

export type AiAnalysis =
  | { status: "success"; provider: string; model?: string; analysis: AiVerdict }
  | { status: "error"; provider: string; error: string; raw_response?: string };

// ─── risk assessment (in progress on the backend) ────────────────────────────
export interface RiskBreakdownItem {
  // The backend shape is still settling; normalise via lib/derive.ts.
  source?: "technical" | "ai" | string;
  category?: string;
  type?: string;
  reason?: string;
  title?: string;
  description?: string;
  points?: number;
  score?: number;
  weight?: number;
  severity?: Severity;
}

export interface RiskAssessment {
  score: number;
  risk_level: RiskLevel;
  confidence: number;
  reasons: (string | { reason?: string; title?: string; description?: string })[];
  breakdown: RiskBreakdownItem[];
}

export interface Investigation {
  technical_evidence: TechnicalEvidence;
  ai_analysis: AiAnalysis;
  risk_assessment?: RiskAssessment;
  observations: Observation[];
}

export interface InvestigateResponse {
  status: "success";
  filename: string;
  email: ParsedEmail;
  investigation: Investigation;
}
