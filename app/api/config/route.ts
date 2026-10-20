import { NextResponse } from "next/server";

/**
 * Returns Supabase public config to the browser.
 *
 * Only NEXT_PUBLIC_SUPABASE_URL was renamed to _SUPABASE_URL in Vercel
 * to avoid the "public prefix" warning.
 * The anon key stays as NEXT_PUBLIC_SUPABASE_ANON_KEY (already public).
 */
export async function GET() {
  // Try _SUPABASE_URL first, fall back to NEXT_PUBLIC_SUPABASE_URL
  const url = process.env._SUPABASE_URL
    ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    ?? "";

  // Anon key stays as NEXT_PUBLIC_ — already accessible in browser,
  // but we read it here too so the client only needs one fetch.
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || !key) {
    return NextResponse.json(
      {
        error:
          "Supabase env vars not configured. " +
          `URL present: ${!!url}, KEY present: ${!!key}. ` +
          "Set _SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ url, key });
}
