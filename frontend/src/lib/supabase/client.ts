import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let client: SupabaseClient | null = null;

// Browser-side Supabase client (singleton).
export function supabase(): SupabaseClient {
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
