import Link from "next/link";
import {
  Bot,
  EyeOff,
  FileSearch,
  Fingerprint,
  Gauge,
  Globe2,
  Link2,
  Lock,
  Network,
  Paperclip,
  Scale,
  ShieldCheck,
  Upload,
  UserRoundSearch,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/top-bar";
import BlurText from "@/components/reactbits/BlurText";
import DecryptedText from "@/components/reactbits/DecryptedText";
import RotatingText from "@/components/reactbits/RotatingText";
import ShinyText from "@/components/reactbits/ShinyText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import TrueFocus from "@/components/reactbits/TrueFocus";
import FaultyTerminal from "@/components/reactbits/FaultyTerminal";
import { site } from "@/lib/site";

const HERO_GRID: [number, number] = [2, 1];

const PRINCIPLES = [
  {
    icon: FileSearch,
    title: "Evidence over verdicts",
    body: "Every finding points to the exact header, link or file it came from. You can check the work, not just trust it.",
    color: "#2667FF",
    glow: "rgb(38 103 255 / 0.14)",
  },
  {
    icon: Scale,
    title: "A risk score, not a probability",
    body: "Points are added by fixed, published rules. The AI can add at most 25, so technical evidence always leads.",
    color: "#D5A021",
    glow: "rgb(213 160 33 / 0.16)",
  },
  {
    icon: EyeOff,
    title: "Private by design",
    body: "No mailbox access. You choose each email to investigate, and results stay in your browser.",
    color: "#A31621",
    glow: "rgb(163 22 33 / 0.12)",
  },
];

const STEPS = [
  { icon: Upload, title: "Upload", body: "Drop a raw .eml file. Nothing is fetched from your inbox." },
  { icon: FileSearch, title: "Parse", body: "Headers, body, links and attachment metadata are extracted." },
  { icon: ShieldCheck, title: "Verify", body: "SPF, DKIM and DMARC results and sender alignment are checked." },
  { icon: Globe2, title: "Enrich", body: "Links go to VirusTotal, relay IPs to IPinfo. Links are never visited." },
  { icon: Gauge, title: "Explain", body: "A rule-based score, AI language analysis and every reason behind it." },
];

const CHECKS = [
  { icon: Fingerprint, title: "SPF · DKIM · DMARC", body: "Was the sender allowed, the message signed, and aligned with the From domain?", glow: "rgb(38 103 255 / 0.14)", color: "#2667FF" },
  { icon: UserRoundSearch, title: "Sender identity", body: "Reply-To and Return-Path compared with the visible sender.", glow: "rgb(163 22 33 / 0.12)", color: "#A31621" },
  { icon: Network, title: "Relay path", body: "Every mail server hop, rebuilt from Received headers with timestamps.", glow: "rgb(47 163 107 / 0.14)", color: "#2FA36B" },
  { icon: Globe2, title: "Geolocation", body: "City, country and network owner for each relay IP, via IPinfo.", glow: "rgb(213 160 33 / 0.16)", color: "#D5A021" },
  { icon: Link2, title: "Link reputation", body: "Each URL checked against VirusTotal, plus IP-based, HTTP and odd-port links.", glow: "rgb(38 103 255 / 0.14)", color: "#2667FF" },
  { icon: Paperclip, title: "Attachments", body: "Executable and disk-image file types flagged. Files are never opened.", glow: "rgb(5 6 9 / 0.08)", color: "#050609" },
  { icon: Bot, title: "AI content analysis", body: "Urgency, impersonation, credential harvesting and other social engineering.", glow: "rgb(38 103 255 / 0.14)", color: "#2667FF" },
  { icon: Gauge, title: "Risk engine", body: "Deterministic points per finding, capped AI support, one transparent score.", glow: "rgb(163 22 33 / 0.12)", color: "#A31621" },
];

// Mirrors backend/detection/risk_engine.py
const RULES: [string, number][] = [
  ["VirusTotal: malicious detections on a link", 35],
  ["SPF failed", 25],
  ["DMARC failed", 25],
  ["Dangerous attachment type", 25],
  ["DKIM failed", 20],
  ["Link uses an IP address", 20],
  ["VirusTotal: suspicious detections on a link", 20],
  ["Link uses a non-standard port", 15],
  ["SPF / DKIM / DMARC softfail or error", 10],
  ["Reply-To differs from sender", 10],
  ["Return-Path differs from sender", 5],
  ["Link uses HTTP", 5],
  ["AI signals (combined, capped)", 25],
];

const BANDS = [
  { label: "Low", range: "0–24", color: "bg-low" },
  { label: "Medium", range: "25–49", color: "bg-gold" },
  { label: "High", range: "50–74", color: "bg-ruby" },
  { label: "Critical", range: "75–100", color: "bg-[#6E0E16]" },
];

export default function LandingPage() {
  const maxPts = Math.max(...RULES.map((r) => r[1]));
  return (
    <div className="dot-matrix min-h-screen text-fg">
      <TopBar active="/" />

      {/* hero */}
      <section className="relative isolate -mt-16 flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-4 pb-24 pt-32 text-snow">
        <div aria-hidden className="absolute inset-0 -z-10">
          <FaultyTerminal
            tint="#2667FF"
            brightness={0.75}
            scale={1.5}
            gridMul={HERO_GRID}
            digitSize={1.2}
            scanlineIntensity={0.4}
            curvature={0.15}
            chromaticAberration={1}
            mouseStrength={0.3}
          />
          {/* keep the headline legible and melt into the page below */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_center,rgb(0_0_0/0.78),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--bg)]" />
        </div>

        <div className="flex max-w-[1100px] flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-snow/15 bg-black/40 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#8fb0ff] backdrop-blur">
            <ShieldCheck className="size-4" />
            <ShinyText text="About Tracemail" />
          </p>
          <BlurText
            as="h1"
            text="Email forensics that shows its work."
            className="mt-7 max-w-[1000px] text-[48px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[76px] lg:text-[104px]"
            stagger={0.07}
          />
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 text-[18px] text-snow/70 sm:text-[21px]">
            Built for
            <RotatingText
              words={["security analysts", "IT teams", "everyday users", "incident response"]}
              className="rounded-lg bg-snow px-2.5 py-0.5 font-semibold text-black"
            />
          </p>
          <p className="mt-6 max-w-[640px] text-[16.5px] leading-relaxed text-snow/65">
            Upload a suspicious email and get a clear verdict for anyone, with the full forensic trail underneath for
            whoever needs to dig in.
          </p>
          <div className="mt-11 flex flex-wrap justify-center gap-3">
            <Link href="/home" className="shiny-cta inline-flex h-13 items-center px-8 text-[15.5px] font-semibold">
              <span>Investigate an email</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-13 items-center rounded-full border border-snow/20 bg-snow/[0.06] px-7 text-[15.5px] font-medium text-snow backdrop-blur hover:bg-snow/[0.12]"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      <main className="px-4 pb-24 pt-8 lg:px-8">
        {/* principles */}
        <section className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, body, color, glow }) => (
            <SpotlightCard key={title} spotlightColor={glow} className="rounded-2xl border border-line bg-panel p-7">
              <Icon className="size-7" strokeWidth={1.75} style={{ color }} />
              <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.02em]">{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{body}</p>
            </SpotlightCard>
          ))}
        </section>

        {/* how it works */}
        <section className="mx-auto mt-28 max-w-[1200px]">
          <SectionHead eyebrow="How it works" title="From raw email to explained verdict in five steps." />
          <ol className="mt-12 grid gap-6 md:grid-cols-5">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="absolute left-12 right-0 top-6 hidden h-px bg-gradient-to-r from-line-strong to-transparent md:block" />
                )}
                <span className="relative flex size-12 items-center justify-center rounded-2xl bg-fg text-snow">
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 font-mono text-[12px] text-subtle">
                  <DecryptedText text={`STEP 0${i + 1}`} />
                </p>
                <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.02em]">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* what we check */}
        <section className="mx-auto mt-28 max-w-[1200px]">
          <SectionHead eyebrow="What gets checked" title="Technical and AI signals, correlated in one investigation." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHECKS.map(({ icon: Icon, title, body, glow, color }) => (
              <SpotlightCard key={title} spotlightColor={glow} className="rounded-2xl border border-line bg-panel p-6">
                <Icon className="size-6" strokeWidth={1.75} style={{ color }} />
                <h3 className="mt-5 text-[16px] font-semibold">{title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{body}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* scoring */}
        <section className="mx-auto mt-28 grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHead eyebrow="Transparent scoring" title="Every point is accounted for." align="left" />
            <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-muted">
              Each finding adds a fixed number of points, the total is capped at 100, and the level follows from the
              total. The AI can support the score but never drive it on its own.
            </p>
            <div className="mt-8 grid max-w-[460px] grid-cols-4 gap-2">
              {BANDS.map((b) => (
                <div key={b.label}>
                  <div className={`h-2 rounded-full ${b.color}`} />
                  <p className="mt-2 text-[13.5px] font-semibold">{b.label}</p>
                  <p className="font-mono text-[12px] text-muted">{b.range}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
            <ul className="divide-y divide-line">
              {RULES.map(([label, pts]) => (
                <li key={label} className="grid grid-cols-[1fr_140px_44px] items-center gap-4 px-5 py-3">
                  <span className="text-[14px]">{label}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-fg/[0.06]">
                    <span className="block h-full rounded-full bg-fg" style={{ width: `${(pts / maxPts) * 100}%` }} />
                  </span>
                  <span className="text-right font-mono text-[13px] font-semibold">+{pts}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* privacy */}
        <section className="relative mx-auto mt-28 max-w-[1200px] overflow-hidden rounded-3xl bg-black px-6 py-16 text-snow sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgb(252_247_248/0.07)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative flex flex-col items-center text-center">
            <Lock className="size-6 text-gold" />
            <h2 className="mt-6 text-[30px] font-semibold tracking-[-0.03em] sm:text-[44px]">
              <TrueFocus sentence="No inbox access. No tracking. Evidence only." blur={6} pause={1} />
            </h2>
            <ul className="mt-10 grid max-w-[900px] gap-6 text-left text-[14.5px] text-snow/75 sm:grid-cols-2">
              <li>Only the file you upload is analysed, one request at a time.</li>
              <li>Results are stored in your browser, not in a shared database.</li>
              <li>HTML bodies preview in a sandbox with scripts, images and links blocked.</li>
              <li>Links are looked up through the VirusTotal API and never opened.</li>
            </ul>
          </div>
        </section>

        {/* stack */}
        <section className="mx-auto mt-28 max-w-[1200px] text-center">
          <SectionHead eyebrow="Built with" title="A small, inspectable stack." />
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {["Next.js", "TypeScript", "Tailwind CSS", "React Flow", "Recharts", "FastAPI", "Python", "Groq", "VirusTotal", "IPinfo"].map((t) => (
              <span key={t} className="rounded-full border border-line bg-panel px-4 py-2 text-[14px] font-medium">
                {t}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-16 max-w-[640px] text-[13.5px] leading-relaxed text-muted">
            Built for Problem Statement 106: AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence
            Platform. Press <kbd className="rounded border border-line bg-panel px-1 font-mono text-[12px]">?</kbd> anywhere for
            keyboard shortcuts. Read our{" "}
            <Link href="/privacy" className="font-medium text-fg underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-4 text-[13.5px] text-muted">
            Presented to you by{" "}
            {site.team.map(({ name, url, role }, i) => (
              <span key={name}>
                {i > 0 && (i === site.team.length - 1 ? " and " : ", ")}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-fg underline underline-offset-2"
                >
                  {name}
                </a>
                {role && ` (${role})`}
              </span>
            ))}
          </p>
        </section>
      </main>
    </div>
  );
}

function SectionHead({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-[760px] text-center" : ""}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sapphire">{eyebrow}</p>
      <BlurText as="h2" text={title} className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[42px]" stagger={0.04} />
    </div>
  );
}
