"use client";

import { CircleCheck, TriangleAlert } from "lucide-react";
import { RiskGauge } from "@/components/investigation/risk-gauge";

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const FINDINGS = [
  { tone: "text-[#ec5a63]", icon: TriangleAlert, text: "DMARC failed for the sender domain", pts: "+25" },
  { tone: "text-[#ec5a63]", icon: TriangleAlert, text: "Link flagged malicious by 2 engines", pts: "+35" },
  { tone: "text-[#e3b341]", icon: TriangleAlert, text: "Reply-To goes to a different domain", pts: "+10" },
  { tone: "text-[#3fcf8e]", icon: CircleCheck, text: "No dangerous attachments", pts: "0" },
];

// Landing hero image: blurred palette light behind a sharp product shot (sample data).
export function HeroVisual() {
  return (
    <div className="hero-reveal relative mt-16 w-full max-w-[1120px]">
      {/* soft shadow glow under the frame */}
      <div aria-hidden className="absolute inset-x-16 -bottom-10 h-24 rounded-full bg-sapphire/25 blur-[60px]" />

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[28px] bg-black ring-1 ring-black/10 sm:aspect-[16/9]">
        {/* blurred light */}
        <div aria-hidden className="absolute inset-0">
          <div className="hero-orb absolute -left-[10%] top-[5%] size-[55%] rounded-full bg-sapphire/60 blur-[110px]" />
          <div className="hero-orb absolute right-[-8%] top-[-15%] size-[50%] rounded-full bg-gold/45 blur-[110px] [animation-delay:-6s]" />
          <div className="hero-orb absolute bottom-[-25%] left-[30%] size-[55%] rounded-full bg-ruby/55 blur-[120px] [animation-delay:-12s]" />
          <div className="absolute inset-0 [background-image:radial-gradient(rgb(252_247_248/0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
          <div className="absolute inset-0 opacity-[0.28] mix-blend-overlay" style={{ backgroundImage: NOISE }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(5_6_9/0.55)_100%)]" />
        </div>

        {/* sharp product card */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-10">
          <div className="grid w-full max-w-[860px] items-center gap-4 rounded-3xl border border-snow/15 bg-black/35 p-4 text-left text-snow shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-6 sm:p-7">
            <div className="flex flex-col items-center">
              <RiskGauge score={82} />
              <p className="-mt-2 text-[20px] font-bold tracking-[-0.03em] text-[#ec5a63] sm:text-[26px]">Critical risk</p>
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="font-mono text-[11.5px] text-snow/50">invoice_overdue.eml · sample</p>
              <p className="mt-1 truncate text-[17px] font-semibold tracking-[-0.02em]">URGENT: Overdue invoice #40912</p>
              <ul className="mt-5 space-y-2.5">
                {FINDINGS.map(({ tone, icon: Icon, text, pts }) => (
                  <li key={text} className="flex items-center gap-3 rounded-xl bg-snow/[0.06] px-3.5 py-2.5 text-[13.5px]">
                    <Icon className={`size-4 shrink-0 ${tone}`} />
                    <span className="flex-1 truncate text-snow/90">{text}</span>
                    <span className="font-mono text-[12.5px] text-snow/60">{pts}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
