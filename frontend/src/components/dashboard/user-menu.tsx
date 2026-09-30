"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Profile = { name: string; email: string; avatar: string | null };

export function UserMenu() {
  const [user, setUser] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase()
      .auth.getUser()
      .then(({ data }) => {
        const u = data.user;
        setChecked(true);
        if (!u) return;
        const m = u.user_metadata ?? {};
        setUser({ name: m.full_name ?? m.name ?? u.email ?? "You", email: u.email ?? "", avatar: m.avatar_url ?? m.picture ?? null });
      });
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase();

  if (checked && !user) {
    return (
      <Link href="/login" className="ml-auto inline-flex h-9 items-center rounded-full bg-fg px-4 text-[13.5px] font-medium text-snow hover:bg-fg/85 sm:ml-0">
        Sign in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative ml-auto sm:ml-0">
      <button
        onClick={() => setOpen((o) => !o)}
        title={user?.email ?? "Account"}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-sapphire text-[14px] font-semibold text-snow ring-4 ring-sapphire/10"
      >
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          initial
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-line bg-panel p-2 shadow-[0_16px_40px_-12px_rgb(5_6_9/0.25)]">
          <div className="px-3 py-2">
            <p className="truncate text-[14px] font-medium">{user?.name ?? "Signed in"}</p>
            <p className="truncate text-[12.5px] text-muted">{user?.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] text-high-fg hover:bg-ruby/[0.06]">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
