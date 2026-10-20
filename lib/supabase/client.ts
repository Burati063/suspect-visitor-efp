import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let configPromise: Promise<{ url: string; key: string }> | null = null;

async function fetchConfig(): Promise<{ url: string; key: string }> {
  if (configPromise) return configPromise;
  configPromise = fetch("/api/config")
    .then(async (res) => {
      const body = await res.json();
      if (!res.ok) {
        configPromise = null;
        throw new Error(body.error ?? `Config API error ${res.status}`);
      }
      return body as { url: string; key: string };
    })
    .catch((err) => {
      configPromise = null;
      throw err;
    });
  return configPromise;
}

/**
 * Get (or create) the Supabase browser client.
 * Always use: const supabase = await getClient();
 */
export async function getClient(): Promise<SupabaseClient> {
  if (cachedClient) return cachedClient;
  const { url, key } = await fetchConfig();
  cachedClient = createSupabaseClient(url, key);
  return cachedClient;
}
