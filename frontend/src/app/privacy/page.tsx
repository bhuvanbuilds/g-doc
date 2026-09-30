import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import BlurText from "@/components/reactbits/BlurText";
import TrueFocus from "@/components/reactbits/TrueFocus";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Privacy Policy · ${site.name}` };

const UPDATED = "30 September 2026";

const AT_A_GLANCE = [
  { k: "Inbox access", v: "None. You upload each email yourself." },
  { k: "Where results live", v: "In your browser, not in our database." },
  { k: "Shared with", v: "VirusTotal, IPinfo and Groq, only what each check needs." },
  { k: "Sold or used for ads", v: "Never." },
];

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "what",
    title: "What we process",
    body: (
      <>
        <p>When you investigate an email, the .eml file you choose is sent to our analysis server. We read its headers, body, links and attachment metadata (file name, type and size). Attachments are never opened or executed.</p>
        <p>When you sign in with Google, we receive your name, email address and profile picture through our authentication provider, Supabase. We use them only to identify your account.</p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Services that see part of the email",
    body: (
      <>
        <p>To check an email, some of its details are sent to these services:</p>
        <ul>
          <li><strong>VirusTotal</strong> receives the links found in the email, to look up their reputation. We never visit the links ourselves.</li>
          <li><strong>IPinfo</strong> receives the IP addresses of the mail servers in the relay path, to find their approximate location and network owner.</li>
          <li><strong>Groq</strong> receives the email content and our technical findings, to produce the AI analysis.</li>
          <li><strong>Supabase</strong> handles sign-in and stores your account session.</li>
        </ul>
        <p>Each service handles data under its own privacy policy. Avoid uploading emails that contain information you aren&apos;t allowed to share with them.</p>
      </>
    ),
  },
  {
    id: "storage",
    title: "Where results are stored",
    body: (
      <>
        <p>The analysis server returns the result to your browser and does not keep a copy. Your investigation history is saved in your browser&apos;s local storage, up to the 40 most recent.</p>
        <p>You can remove it at any time with <em>Hold to clear history</em> on the dashboard, or by clearing this site&apos;s data in your browser.</p>
      </>
    ),
  },
  {
    id: "safety",
    title: "How we keep the preview safe",
    body: (
      <p>HTML email bodies are shown in a sandbox with scripts, remote images and links blocked, so opening a result doesn&apos;t trigger tracking pixels or load anything from the sender.</p>
    ),
  },
  {
    id: "location",
    title: "About location data",
    body: (
      <p>Relay locations describe mail-server infrastructure. They do not identify the person who sent the email, and we never present them as the sender&apos;s location.</p>
    ),
  },
  {
    id: "not",
    title: "What we don't do",
    body: (
      <ul>
        <li>We don&apos;t connect to or read your mailbox.</li>
        <li>We don&apos;t sell data or use it for advertising.</li>
        <li>We don&apos;t use your emails to train AI models.</li>
        <li>We don&apos;t add analytics or tracking cookies. The only cookies are the ones that keep you signed in.</li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "Your choices",
    body: (
      <p>You can sign out at any time, clear your investigation history, and ask us to delete your account. Only investigate emails you are authorised to handle.</p>
    ),
  },
  {
    id: "changes",
    title: "Changes",
    body: (
      <p>{site.name} is a prototype built for a hackathon. If what we collect changes, we&apos;ll update this page and the date above.</p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="dot-matrix min-h-screen text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-panel/75 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-5 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </div>
      </header>

      <main className="px-4 pb-24 lg:px-8">
        {/* hero */}
        <section className="relative mx-auto mt-6 max-w-[1100px] overflow-hidden rounded-3xl bg-black px-6 py-16 text-center text-snow sm:py-24">
          <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgb(252_247_248/0.07)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative flex flex-col items-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-snow/10">
              <Lock className="size-5 text-gold" />
            </span>
            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-snow/60">Privacy Policy</p>
            <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.04em] sm:text-[60px]">
              <TrueFocus sentence="Your emails stay yours." blur={7} pause={1.1} />
            </h1>
            <p className="mt-6 max-w-[560px] text-[15.5px] leading-relaxed text-snow/70">
              What {site.name} does with the emails you investigate, in plain language.
            </p>
            <p className="mt-4 font-mono text-[12px] text-snow/45">Last updated {UPDATED}</p>
          </div>
        </section>

        {/* at a glance */}
        <section className="mx-auto mt-6 grid max-w-[1100px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AT_A_GLANCE.map((x) => (
            <div key={x.k} className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">{x.k}</p>
              <p className="mt-2 text-[15px] font-medium leading-snug">{x.v}</p>
            </div>
          ))}
        </section>

        {/* body */}
        <div className="mx-auto mt-14 grid max-w-[1100px] gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav className="hidden lg:block">
            <ul className="sticky top-24 space-y-0.5 text-[13.5px]">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-muted hover:bg-fg/5 hover:text-fg">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="space-y-12">
            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <p className="font-mono text-[12px] text-subtle">0{i + 1}</p>
                <BlurText as="h2" text={s.title} className="mt-1 text-[24px] font-semibold tracking-[-0.025em]" stagger={0.04} />
                <div className="mt-4 space-y-3 text-[15.5px] leading-relaxed text-fg/80 [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.65em] [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-gold [&_strong]:font-semibold [&_strong]:text-fg [&_ul]:space-y-2">
                  {s.body}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
    </div>
  );
}
