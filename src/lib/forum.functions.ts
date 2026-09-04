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
  "entraide",
  "animaux",
  "cuisine",
] as const;

type Profile = { id: string; name: string | null; city: string | null; verified: boolean; profile_type: string | null };

async function attachAuthors<T extends { user_id: string }>(
  sb: ReturnType<typeof getAnonClient>,
  rows: T[],
): Promise<(T & { author: Profile | null })[]> {
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  if (ids.length === 0) return [];
  const { data: profs } = await sb
    .from("profiles")
    .select("id, name, city, verified, profile_type")
    .in("id", ids);
  const map = new Map((profs ?? []).map((p) => [p.id, p as Profile]));
  return rows.map((r) => ({ ...r, author: map.get(r.user_id) ?? null }));
}

export const listForumTopics = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ city: z.string().trim().max(80).optional(), category: z.enum(CATEGORIES).optional() })
      .optional()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    let q = sb
      .from("forum_topics")
      .select("id, user_id, title, content, city, category, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data?.city) q = q.ilike("city", `%${data.city}%`);
    if (data?.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const withAuthors = await attachAuthors(sb, rows ?? []);
    const ids = withAuthors.map((t) => t.id);
    const counts = new Map<string, number>();
    if (ids.length) {
      const { data: replies } = await sb.from("forum_replies").select("topic_id").in("topic_id", ids);
      for (const r of replies ?? []) counts.set(r.topic_id, (counts.get(r.topic_id) ?? 0) + 1);
    }
    return {
      topics: withAuthors.map((t) => ({ ...t, reply_count: counts.get(t.id) ?? 0, mine: auth?.userId === t.user_id })),
    };
  });

export const getForumTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    const { data: topic, error } = await sb
      .from("forum_topics")
      .select("id, user_id, title, content, city, category, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!topic) throw new Error("Sujet introuvable.");
    const { data: replies } = await sb
      .from("forum_replies")
      .select("id, user_id, content, created_at")
      .eq("topic_id", data.id)
      .order("created_at", { ascending: true })
      .limit(300);
    const [t] = await attachAuthors(sb, [topic]);
    const r = await attachAuthors(sb, replies ?? []);
    return {
      topic: { ...t!, mine: auth?.userId === topic.user_id },
      replies: r.map((x) => ({ ...x, mine: auth?.userId === x.user_id })),
    };
  });

export const createForumTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(4).max(140),
        content: z.string().trim().min(5).max(4000),
        city: z.string().trim().max(80).optional().nullable(),
        category: z.enum(CATEGORIES).default("entraide"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("forum_topics")
      .insert({ ...data, city: data.city || null, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const createForumReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ topic_id: z.string().uuid(), content: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("forum_replies")
      .insert({ topic_id: data.topic_id, content: data.content, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteForumTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("forum_topics")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
