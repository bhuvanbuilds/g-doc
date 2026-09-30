import { GoogleButton } from "@/components/auth/google-button";
import { ThreatScene } from "@/components/auth/threat-scene";
import { Logo } from "@/components/brand/logo";
import TechText from "@/components/reactbits/TechText";
import { site } from "@/lib/site";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[62fr_38fr]">
      {/* brand — black */}
      <section className="relative hidden overflow-hidden bg-black lg:flex lg:flex-col">
        <div
          aria-hidden
          className="absolute inset-0 [background-image:radial-gradient(rgb(252_247_248/0.09)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-[38%] h-[360px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[110px]"
        />

        <div className="relative px-12 pt-10 text-snow">
          <Logo />
        </div>

        <div className="relative flex flex-1 items-center justify-center px-12">
          <div className="w-full max-w-[600px]">
            <ThreatScene />
          </div>
        </div>

        <div className="relative px-12 pb-12">
          <div className="-ml-[3%] h-[130px] w-[min(100%,620px)]">
            <TechText
              text={site.name}
              fontWeight={700}
              fontSize={150}
              letterSpacing={-0.055}
              color="#FCF7F8"
              accentColor="#D5A021"
              reveal="letter"
              specks={12}
            />
          </div>
          <p className="mt-2 text-[15px] text-snow/65">
            Evidence-linked investigation for suspicious email.
          </p>
        </div>
      </section>

      {/* sign in — snow */}
      <section className="flex flex-col bg-snow px-8 py-10 text-black sm:px-14">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-16">
          <h1 className="text-[30px] font-semibold tracking-[-0.03em]">Sign in</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-black/60">
            Use your Google account to start investigating emails.
          </p>

          <div className="mt-8">
            <GoogleButton variant="outline" />
          </div>

          <div className="my-8 h-px bg-black/10" />

          <p className="text-[13.5px] leading-relaxed text-black/60">
            No inbox access. Only the .eml files you choose to upload are analysed.
          </p>
        </div>

        <p className="text-[13px] text-black/50">© {site.name}</p>
      </section>
    </main>
  );
}
