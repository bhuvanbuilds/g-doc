import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import ClickSpark from "@/components/reactbits/ClickSpark";
import { site } from "@/lib/site";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: site.name,
  description: "Evidence-linked email threat investigation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${interTight.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ClickSpark sparkColor="#2667FF" sparkSize={10} sparkRadius={18} sparkCount={8} duration={420}>
          {children}
        </ClickSpark>
      </body>
    </html>
  );
}
