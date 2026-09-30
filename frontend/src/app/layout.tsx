import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import ClickSpark from "@/components/reactbits/ClickSpark";
import { Shortcuts } from "@/components/shortcuts";
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

const title = `${site.name} · AI Phishing, Spam & Junk Email Detector`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  authors: site.authors.map(({ name, url }) => ({ name, url })),
  creator: "Bhuvanesh J",
  category: "security",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: site.name,
  url: site.url,
  description: site.description,
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  keywords: site.keywords.join(", "),
  creator: { "@type": "Person", name: "Bhuvanesh J" },
  contributor: {
    "@type": "Person",
    name: "D Prem Sankar",
    url: "https://prem.ikaruz.in",
    jobTitle: "UI/UX Designer",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <ClickSpark sparkColor="#2667FF" sparkSize={10} sparkRadius={18} sparkCount={8} duration={420}>
          {children}
        </ClickSpark>
        <Shortcuts />
      </body>
    </html>
  );
}
