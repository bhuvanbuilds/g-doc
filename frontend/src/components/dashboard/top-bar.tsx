import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { ShortcutsButton } from "./shortcuts-button";
import { UserMenu } from "./user-menu";

const nav = [
  { href: "/home", label: "Investigate", key: "H" },
  { href: "/dashboard", label: "Dashboard", key: "D" },
  { href: "/", label: "About", key: "A" },
];

export function TopBar({ active }: { active?: "/home" | "/dashboard" | "/" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 pt-[env(safe-area-inset-top)] sm:bg-panel/75 sm:backdrop-blur-xl">
      <div className="flex h-14 items-center gap-8 px-4 sm:h-16 sm:px-5 lg:px-8">
        <Link href="/home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              title={`${n.label} (${n.key})`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors",
                n.href === active ? "bg-fg text-snow" : "text-muted hover:bg-fg/5 hover:text-fg"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <ShortcutsButton />
        <UserMenu />
      </div>
    </header>
  );
}
