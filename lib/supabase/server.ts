import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * _SUPABASE_URL = renamed from NEXT_PUBLIC_SUPABASE_URL in Vercel to avoid public prefix warning.
 * NEXT_PUBLIC_SUPABASE_ANON_KEY = kept as-is.
 */
export async function createClient() {
  const url = process.env._SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createSupabaseClient(url, key);
}
