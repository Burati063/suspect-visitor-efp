import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client — DB queries only, no auth.
 * Uses the anon key; RLS policies are set to fully open (see migration.sql).
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
