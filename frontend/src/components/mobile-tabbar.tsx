"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, LayoutDashboard, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

// Phone-only navigation. The top bar's links are hidden below `sm`, so this is
// the only way around the app on a phone. The centre button is the primary
// action: on the Investigate page it opens the file picker straight away.
export function MobileTabBar() {
  const path = usePathname();
  if (path === "/login") return null;

  const investigating = path === "/home" || path.startsWith("/investigate");

  return (
    <>
      <div aria-hidden className="mobile-tabbar-space shrink-0 sm:hidden print:hidden" />
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-panel/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgb(5_6_9/0.25)] sm:hidden print:hidden"
      >
        <ul className="grid h-16 grid-cols-3 items-center">
          <Tab href="/dashboard" label="Dashboard" active={path === "/dashboard"} icon={LayoutDashboard} />
          <li className="flex justify-center">
            <Link
              href="/home"
              aria-current={investigating ? "page" : undefined}
              onClick={(e) => {
                if (path !== "/home") return;
                e.preventDefault();
                window.dispatchEvent(new Event("tm:open-upload"));
              }}
              className="tap-press -mt-7 flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-full bg-sapphire text-snow shadow-[0_10px_24px_-8px_rgb(38_103_255/0.7)] ring-4 ring-bg",
                  investigating && "bg-fg shadow-[0_10px_24px_-8px_rgb(5_6_9/0.6)]"
                )}
              >
                <ScanSearch className="size-6" />
              </span>
              <span className={cn("text-[11px] font-semibold", investigating ? "text-fg" : "text-muted")}>
                {path === "/home" ? "Upload" : "Investigate"}
              </span>
            </Link>
          </li>
          <Tab href="/" label="About" active={path === "/"} icon={Info} />
        </ul>
      </nav>
    </>
  );
}

function Tab({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: typeof Info;
}) {
  return (
    <li className="h-full">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "tap-press flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold",
          active ? "text-fg" : "text-muted"
        )}
      >
        <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-fg/[0.07]")}>
          <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} />
        </span>
        {label}
      </Link>
    </li>
  );
}
