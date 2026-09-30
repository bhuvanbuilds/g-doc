import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" fill="#2667ff" />
        <path d="M5.5 8.5 12 13l6.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 8.5v7h7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <circle cx="16.5" cy="15.5" r="2.25" stroke="#fff" strokeWidth="1.6" />
      </svg>
    ),
    size,
  );
}
