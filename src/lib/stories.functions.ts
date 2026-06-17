import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAnonClient, tryGetUser } from "@/lib/supabase-public.server";
import { z } from "zod";

const CATEGORIES = [
  "administratif",
  "sante",
  "voyage",
  "services_locaux",
  "commerce_international",
  "apprentissage",
] as const;

export const createStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        category: z.enum(CATEGORIES),
        content: z.string().trim().min(1).max(500),
        visibility: z.enum(["public", "private"]).default("public"),
        allowed_user_ids: z.array(z.string().uuid()).max(50).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("stories")
      .insert({
        user_id: context.userId,
        category: data.category,
        content: data.content,
        visibility: data.visibility,
        allowed_user_ids: data.allowed_user_ids ?? [],
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listStories = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ category: z.enum(CATEGORIES).optional(), limit: z.number().int().min(1).max(50).optional() })
      .optional()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    let q = sb
      .from("stories")
      .select("id, user_id, category, content, visibility, created_at, expires_at")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(data?.limit ?? 30);
    if (data?.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const { data: profs } = await sb
      .from("profiles")
      .select("id, name, city, profile_type")
      .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
    return {
      stories: (rows ?? []).map((r) => ({
        ...r,
        author: pmap.get(r.user_id) ?? null,
        mine: auth ? r.user_id === auth.userId : false,
      })),
    };
  });

export const deleteStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("stories").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
