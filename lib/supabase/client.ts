import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // This will appear in the browser console and in Vercel build logs.
  // It means the env vars are not set in Vercel → Settings → Environment Variables.
  console.error(
    "[SVS] Supabase env vars missing!\n" +
    "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.\n" +
    `URL present: ${!!url}, KEY present: ${!!key}`
  );
}

/**
 * Browser-side Supabase client — no auth, DB queries only.
 * RLS policies are fully open (see supabase/migration.sql).
 */
export function createClient() {
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "in Vercel → Project Settings → Environment Variables, then redeploy."
    );
  }
  return createSupabaseClient(url, key);
}
