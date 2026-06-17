import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

function env() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  return { url, key };
}

/** Anonymous-role client for reads protected by anon SELECT policies. */
export function getAnonClient() {
  const { url, key } = env();
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Best-effort user resolver for public-readable server fns. Returns null
 * when no valid bearer is attached (guest mode).
 */
export async function tryGetUser(): Promise<{ userId: string; supabase: ReturnType<typeof getAnonClient> } | null> {
  try {
    const req = getRequest();
    const authHeader = req?.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7).trim();
    if (!token) return null;
    const { url, key } = env();
    const supabase = createClient<Database>(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    return { userId: data.claims.sub, supabase };
  } catch {
    return null;
  }
}
