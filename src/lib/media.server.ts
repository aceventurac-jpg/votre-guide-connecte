import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * The media bucket is private (public buckets are blocked by workspace policy),
 * so every stored path is turned into a short-lived signed URL at read time.
 */
export async function signPaths(paths: string[], expiresIn = 60 * 60): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (!unique.length) return {};
  const out: Record<string, string> = {};
  try {
    const { data } = await supabaseAdmin.storage.from("media").createSignedUrls(unique, expiresIn);
    (data ?? []).forEach((s) => {
      if (s.signedUrl && s.path) out[s.path] = s.signedUrl;
    });
  } catch {
    /* ignore: media simply won't render */
  }
  return out;
}

export function signOne(map: Record<string, string>, path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return map[path] ?? null;
}
