import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: AI phishing, spam and junk email detector`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0b0d12",
          color: "#fcf7f8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="1" width="22" height="22" rx="6" fill="#2667ff" />
            <path d="M5.5 8.5 12 13l6.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 8.5v7h7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            <circle cx="16.5" cy="15.5" r="2.25" stroke="#fff" strokeWidth="1.6" />
          </svg>
          <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2 }}>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 72, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>
            Is this email safe?
          </span>
          <span style={{ fontSize: 34, color: "rgba(252,247,248,0.7)" }}>
            AI phishing, spam and junk email detector with header forensics and IP geolocation.
          </span>
        </div>
      </div>
    ),
    size,
  );
}
