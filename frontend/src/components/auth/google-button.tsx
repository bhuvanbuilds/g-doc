"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

const variants = {
  solid: "bg-black text-snow hover:bg-black/85",
  outline: "border border-black/15 bg-white text-black shadow-[0_1px_2px_rgb(5_6_9/0.06)] hover:bg-black/[0.03]",
};

// Google sign-in through Supabase Auth. Returns via /auth/callback.
export function GoogleButton({ variant = "solid" }: { variant?: keyof typeof variants }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Supabase isn't configured. Add the keys to .env.local.");
      return;
    }
    setLoading(true);
    const next = new URLSearchParams(window.location.search).get("next") ?? "/home";
    const { error } = await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className={`flex h-12 w-full items-center justify-center gap-3 rounded-lg text-[15px] font-medium transition active:scale-[0.99] disabled:opacity-70 ${variants[variant]}`}
      >
        <span className="flex size-[22px] items-center justify-center rounded-full bg-white">
          {loading ? <Loader2 className="size-4 animate-spin text-black" /> : <GoogleIcon />}
        </span>
        {loading ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {error && <p className="rounded-md border border-ruby/30 bg-ruby/[0.06] px-3 py-2 text-[13px] text-ruby">{error}</p>}
    </div>
  );
}
