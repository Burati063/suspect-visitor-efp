import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let configPromise: Promise<{ url: string; key: string }> | null = null;

/**
 * Fetch config from /api/config (server reads env vars that aren't
 * prefixed with NEXT_PUBLIC_ so the browser can't see them directly).
 */
async function fetchConfig(): Promise<{ url: string; key: string }> {
  if (configPromise) return configPromise;

  configPromise = fetch("/api/config")
    .then(async (res) => {
      const body = await res.json();
      if (!res.ok || !body.url || !body.key) {
        configPromise = null;
        throw new Error(
          body.error ??
            "Could not load Supabase config from /api/config. " +
            "Check Vercel → Settings → Environment Variables."
        );
      }
      return { url: body.url as string, key: body.key as string };
    })
    .catch((err) => {
      configPromise = null;
      throw err;
    });

  return configPromise;
}

/**
 * Returns the Supabase client, initialising it on first call.
 * Always use: const supabase = await getClient();
 */
export async function getClient(): Promise<SupabaseClient> {
  if (cachedClient) return cachedClient;
  const { url, key } = await fetchConfig();
  cachedClient = createSupabaseClient(url, key);
  return cachedClient;
}
