// Attacker → shield → recipient. Pure SVG + CSS keyframes (see globals.css "scene").
// Each mail cycle is 3.6s, three mails staggered 1.2s apart, so the shield is hit
// every 1.2s. The middle mail passes the scan and continues to the recipient.

// Line icons in public/assets, recoloured via alpha masks so they read on black.
const ATTACKER_IMG = "/assets/hacker.png";
const USER_IMG = "/assets/user.png";

const RUBY = "var(--ruby)";
const GOLD = "var(--gold)";
const SAPPHIRE = "var(--sapphire)";
const SNOW = "var(--snow)";

const SHIELD =
  "M0 -62 L50 -44 V-4 C50 30 28 52 0 64 C-28 52 -50 30 -50 -4 V-44 Z";

function Envelope({ stroke }: { stroke: string }) {
  return (
    <g>
      <rect x="-15" y="-10" width="30" height="20" rx="2" fill="var(--black)" stroke={stroke} strokeWidth="1.8" />
      <path d="M-13 -7.5 0 1.5 13 -7.5" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

const mails = [
  { delay: "0s", label: "SPF fail", tone: RUBY, text: "var(--risk-high-fg)", blocked: true },
  { delay: "1.2s", label: "Verified", tone: SAPPHIRE, text: "var(--brand-fg)", blocked: false },
  { delay: "2.4s", label: "Lookalike domain", tone: GOLD, text: GOLD, blocked: true },
];

export function ThreatScene() {
  return (
    <svg
      viewBox="0 0 640 320"
      className="scene w-full max-w-[640px] overflow-visible"
      role="img"
      aria-label="An attacker's emails are stopped by a shield before reaching the recipient"
    >
      <defs>
        <mask id="mask-attacker" style={{ maskType: "alpha" }}>
          <image href={ATTACKER_IMG} x="28" y="98" width="104" height="104" />
        </mask>
        <mask id="mask-user" style={{ maskType: "alpha" }}>
          <image href={USER_IMG} x="508" y="98" width="104" height="104" />
        </mask>
        <clipPath id="shield-clip">
          <path d={SHIELD} />
        </clipPath>
      </defs>

      {/* connections */}
      <line x1="140" y1="150" x2="262" y2="150" stroke={RUBY} strokeWidth="1.5" strokeDasharray="3 7" className="scene-flow" />
      <line x1="378" y1="150" x2="500" y2="150" stroke={SAPPHIRE} strokeWidth="1.5" strokeDasharray="3 7" className="scene-flow" />

      <rect x="28" y="98" width="104" height="104" fill="var(--risk-high-fg)" mask="url(#mask-attacker)" />
      <rect x="508" y="98" width="104" height="104" fill={SNOW} mask="url(#mask-user)" />

      {/* attacker */}
      <g transform="translate(80 150)">

        <text y="82" textAnchor="middle" className="fill-snow text-[15px] font-medium">Attacker</text>
      </g>

      {/* recipient */}
      <g transform="translate(560 150)">
        <text y="82" textAnchor="middle" className="fill-snow text-[15px] font-medium">Recipient</text>
      </g>

      {/* mail — inbound */}
      {mails.map((m) => (
        <g key={m.delay} transform="translate(152 150)">
          <g className={m.blocked ? "scene-mail-blocked" : "scene-mail-in"} style={{ animationDelay: m.delay }}>
            <Envelope stroke={m.blocked ? m.tone : SNOW} />
          </g>
        </g>
      ))}

      {/* mail — outbound (the one that passed) */}
      <g transform="translate(380 150)">
        <g className="scene-mail-out" style={{ animationDelay: "1.2s" }}>
          <Envelope stroke={SAPPHIRE} />
        </g>
      </g>

      {/* shield */}
      <g transform="translate(320 150)">
        <path d={SHIELD} fill={SAPPHIRE} className="scene-hit" style={{ animationDelay: "0.89s" }} />
        <g clipPath="url(#shield-clip)">
          <rect x="-60" y="-1.5" width="120" height="3" fill={GOLD} className="scene-scan" />
        </g>
        <circle cx="-4" cy="-4" r="15" fill="none" stroke={SNOW} strokeWidth="3.5" />
        <path d="M7 7 17 17" stroke={SNOW} strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* verdict tags */}
      {mails.map((m) => (
        <g key={m.label} transform="translate(320 262)">
          <g className="scene-chip" style={{ animationDelay: m.delay }}>
            <rect x="-78" y="-15" width="156" height="30" rx="4" fill="var(--black)" stroke={m.tone} strokeWidth="1.5" />
            <text y="5" textAnchor="middle" className="font-mono text-[13px] font-medium" style={{ fill: m.text }}>
              {m.label}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}
