import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/home", label: "Investigate" },
  { href: "/dashboard", label: "Dashboard" },
];

export function TopBar({ active }: { active?: "/home" | "/dashboard" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/75 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-8 px-5 lg:px-8">
        <Link href="/home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors",
                n.href === active ? "bg-fg text-snow" : "text-muted hover:bg-fg/5 hover:text-fg"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          title="Sign out"
          className="ml-auto flex size-9 items-center justify-center rounded-full bg-sapphire text-[14px] font-semibold text-snow ring-4 ring-sapphire/10"
        >
          P
        </Link>
      </div>
    </header>
  );
}
