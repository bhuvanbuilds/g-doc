import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 sm:scroll-mt-36 lg:scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-[20px] font-semibold tracking-[-0.025em] sm:text-[22px]">{title}</h2>
        {description && <p className="mt-1 text-[14px] text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-panel", className)}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-6 py-8 text-center text-[14px] text-muted">{children}</p>;
}
