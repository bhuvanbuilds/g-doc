import { GoogleButton } from "@/components/auth/google-button";
import { ThreatScene } from "@/components/auth/threat-scene";
import { Logo } from "@/components/brand/logo";
import TechText from "@/components/reactbits/TechText";
import { site } from "@/lib/site";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen lg:grid-cols-[35fr_65fr]">
      {/* palette stripe */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 flex h-1">
        <span className="flex-1 bg-ruby" />
        <span className="flex-1 bg-gold" />
        <span className="flex-[2] bg-sapphire" />
      </div>

      {/* sign-in — snow */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-snow px-8 pb-12 pt-10 text-black sm:px-12 xl:px-16">
        {/* faded grid, anchored top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[70%] w-[85%] [background-image:linear-gradient(to_right,rgb(5_6_9/0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgb(5_6_9/0.09)_1px,transparent_1px)] [background-size:44px_44px] [background-position:right_-1px_top_-1px] [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_70%)]"
        />

        <Logo className="relative" />

        <div className="relative py-16">
          <h1 className="text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] xl:text-[56px]">
            Every verdict,
            <br />
            backed by
            <br />
            <span className="text-sapphire">evidence.</span>
          </h1>

          <div className="mt-10 max-w-[360px]">
            <GoogleButton />
          </div>
        </div>
      </section>

      {/* scene — black */}
      <section className="hidden flex-col bg-black lg:flex">
        <div className="h-[220px] shrink-0 px-10 pt-10 xl:h-[260px]">
          <TechText
            text={site.name}
            fontWeight={600}
            fontSize={180}
            color="#FCF7F8"
            accentColor="#2667FF"
            reveal="letter"
            dashLength={4}
            dashGap={2}
            specks={15}
          />
        </div>

        <div className="flex flex-1 items-center justify-center px-12 pb-12">
          <ThreatScene />
        </div>
      </section>
    </main>
  );
}
