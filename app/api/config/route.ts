import { NextResponse } from "next/server";

/**
 * Serves Supabase public credentials to the browser.
 *
 * Tries every naming variant so it works regardless of how the env vars
 * were named in Vercel (with or without NEXT_PUBLIC_ prefix, with _ prefix, etc.)
 */
export async function GET() {
  // Try every possible name the URL might have been saved as
  const url =
    process.env._SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";

  // Try every possible name the anon key might have been saved as
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env._SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    "";

  // Debug: log what was found (visible in Vercel function logs)
  console.log("[SVS /api/config]", {
    urlFound: !!url,
    keyFound: !!key,
    urlPreview: url ? url.slice(0, 30) + "..." : "MISSING",
  });

  if (!url || !key) {
    return NextResponse.json(
      {
        error:
          `Supabase configuration missing on server. ` +
          `URL found: ${!!url}, KEY found: ${!!key}. ` +
          `Go to Vercel → your project → Settings → Environment Variables ` +
          `and make sure these are set: ` +
          `_SUPABASE_URL (your Supabase project URL) and ` +
          `NEXT_PUBLIC_SUPABASE_ANON_KEY (your anon/public key). ` +
          `Then redeploy.`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ url, key });
}
