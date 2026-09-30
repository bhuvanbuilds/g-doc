"use client";

import { useEffect, useState } from "react";

// Ookla-style speedometer for the 0–100 risk score, drawn for a dark surface.
const CX = 200;
const CY = 200;
const R = 158;
const START = 135; // degrees, 0° = 3 o'clock, clockwise
const SWEEP = 270;
const SEGMENTS = 72;

const STOPS: [number, [number, number, number]][] = [
  [0, [63, 207, 142]], // green
  [30, [213, 160, 33]], // goldenrod
  [62, [236, 90, 99]], // light ruby
  [100, [200, 29, 42]], // ruby
];

export function scoreColor(v: number) {
  const x = Math.max(0, Math.min(100, v));
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, c1] = STOPS[i];
    const [p0, c0] = STOPS[i - 1];
    if (x <= p1) {
      const t = (x - p0) / (p1 - p0);
      const c = c0.map((a, k) => Math.round(a + (c1[k] - a) * t));
      return `rgb(${c[0]} ${c[1]} ${c[2]})`;
    }
  }
  return "rgb(200 29 42)";
}

const rad = (deg: number) => (deg * Math.PI) / 180;
// Rounded so server and browser render identical SVG (float trig can differ in the last digits).
const round = (n: number) => Math.round(n * 100) / 100;
const polar = (deg: number, r: number) => [round(CX + r * Math.cos(rad(deg))), round(CY + r * Math.sin(rad(deg)))] as const;

function arc(a0: number, a1: number, r: number) {
  const [x0, y0] = polar(a0, r);
  const [x1, y1] = polar(a1, r);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

// easeOutBack-ish: fast sweep, small overshoot, settle — like a needle.
function ease(t: number) {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function useSweep(target: number | null, duration = 1900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setV(target));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const t0 = performance.now() + 250;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - t0) / duration));
      setV(target * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function RiskGauge({ score }: { score: number | null }) {
  const v = useSweep(score);
  const shown = Math.max(0, Math.min(100, v));
  const needleAngle = START + (SWEEP * shown) / 100;
  const segSweep = SWEEP / SEGMENTS;
  const lit = (shown / 100) * SEGMENTS;
  const color = scoreColor(shown);

  return (
    <svg viewBox="0 0 400 340" className="w-full max-w-[440px]" role="img" aria-label={score === null ? "Risk score pending" : `Risk score ${score} out of 100`}>
      <defs>
        <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id="hub" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#2a2e37" />
          <stop offset="1" stopColor="#0b0d11" />
        </radialGradient>
      </defs>

      {/* segments: track + lit */}
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const a0 = START + i * segSweep + 0.6;
        const a1 = START + (i + 1) * segSweep - 0.6;
        const on = i < lit;
        const partial = on && i + 1 > lit;
        return (
          <path
            key={i}
            d={arc(a0, a1, R)}
            fill="none"
            strokeWidth={22}
            stroke={on ? scoreColor(((i + 0.5) / SEGMENTS) * 100) : "#1C1F26"}
            opacity={partial ? 0.55 + 0.45 * (lit - i) : 1}
          />
        );
      })}

      {/* glow under the lit arc */}
      {shown > 0.5 && (
        <path d={arc(START, needleAngle, R)} fill="none" stroke={color} strokeWidth={22} opacity={0.35} filter="url(#gauge-glow)" />
      )}

      {/* ticks + labels */}
      {Array.from({ length: 11 }, (_, i) => {
        const a = START + (SWEEP * i) / 10;
        const [x0, y0] = polar(a, R - 20);
        const [x1, y1] = polar(a, R - 30);
        const [lx, ly] = polar(a, R - 48);
        const active = i * 10 <= shown + 0.001;
        return (
          <g key={i}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={active ? "#FCF7F8" : "#3a3f49"} strokeWidth={2} strokeLinecap="round" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono"
              fontSize={13}
              fill={active ? "#FCF7F8" : "#5c616c"}
            >
              {i * 10}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 50 }, (_, i) => {
        if (i % 5 === 0) return null;
        const a = START + (SWEEP * i) / 50;
        const [x0, y0] = polar(a, R - 20);
        const [x1, y1] = polar(a, R - 25);
        return <line key={`m${i}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#2a2e37" strokeWidth={1.5} />;
      })}

      {/* needle */}
      {score !== null && (
        <g transform={`rotate(${needleAngle} ${CX} ${CY})`}>
          <polygon points={`${CX},${CY - 7} ${CX + R - 36},${CY - 1.5} ${CX + R - 36},${CY + 1.5} ${CX},${CY + 7}`} fill={color} />
          <polygon points={`${CX},${CY - 7} ${CX + R - 36},${CY - 1.5} ${CX + R - 36},${CY + 1.5} ${CX},${CY + 7}`} fill={color} opacity={0.5} filter="url(#gauge-glow)" />
        </g>
      )}
      <circle cx={CX} cy={CY} r={22} fill="url(#hub)" stroke="#2a2e37" strokeWidth={2} />
      <circle cx={CX} cy={CY} r={6} fill={score === null ? "#3a3f49" : color} />

      {/* readout */}
      <text x={CX} y={CY + 78} textAnchor="middle" fill="#FCF7F8" fontSize={64} fontWeight={700} letterSpacing={-2.5} className="tabular-nums">
        {score === null ? "–" : Math.round(shown)}
      </text>
      <text x={CX} y={CY + 104} textAnchor="middle" fill="#8A8F9A" fontSize={12} letterSpacing={2.5} className="font-mono">
        RISK SCORE / 100
      </text>
    </svg>
  );
}
