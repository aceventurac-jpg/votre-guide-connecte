import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAnonClient, tryGetUser } from "@/lib/supabase-public.server";
import { z } from "zod";

export const SERVICE_CATEGORIES = [
  "Ménage",
  "Bricolage",
  "Jardinage",
  "Garde d'enfants",
  "Cours particuliers",
  "Informatique",
  "Coiffure & beauté",
  "Déménagement",
  "Autre",
] as const;

export const createService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(3).max(140),
        description: z.string().trim().min(10).max(2000),
        category: z.enum(SERVICE_CATEGORIES),
        city: z.string().trim().max(80).optional().nullable(),
        price: z.number().nonnegative().max(100000).nullable().optional(),
        availability_today: z.string().trim().max(120).optional().nullable(),
        media: z.object({ type: z.enum(["image", "video"]), path: z.string().min(1).max(400) }).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { media, ...svc } = data;
    const { error, data: row } = await context.supabase
      .from("services")
      .insert({
        ...svc,
        user_id: context.userId,
        media_url: media?.path ?? null,
        media_type: media?.type ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listServices = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        category: z.enum(SERVICE_CATEGORIES).optional(),
        city: z.string().trim().max(80).optional(),
        available_today: z.boolean().optional(),
      })
      .optional()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    let q = sb
      .from("services")
      .select(
        "id, user_id, title, description, category, city, price, availability_today, media_url, media_type, created_at",
      )
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data?.category) q = q.eq("category", data.category);
    if (data?.city) q = q.ilike("city", `%${data.city}%`);
    if (data?.available_today) q = q.not("availability_today", "is", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id);
    const safeIds = ids.length ? ids : ["00000000-0000-0000-0000-000000000000"];
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const safeUsers = userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"];

    const [{ data: profs }, { data: reviews }] = await Promise.all([
      sb.from("profiles").select("id, name, city, avatar_url, verified").in("id", safeUsers),
      sb.from("service_reviews").select("service_id, rating").in("service_id", safeIds),
    ]);

    const { signPaths, signOne } = await import("@/lib/media.server");
    const urlMap = await signPaths([
      ...(rows ?? []).map((r) => r.media_url ?? ""),
      ...(profs ?? []).map((p) => p.avatar_url ?? ""),
    ]);

    const pmap = new Map((profs ?? []).map((p) => [p.id, { ...p, avatar_url: signOne(urlMap, p.avatar_url) }]));
    const rstats = new Map<string, { sum: number; count: number }>();
    (reviews ?? []).forEach((r) => {
      const cur = rstats.get(r.service_id) ?? { sum: 0, count: 0 };
      rstats.set(r.service_id, { sum: cur.sum + r.rating, count: cur.count + 1 });
    });

    return {
      services: (rows ?? []).map((r) => {
        const st = rstats.get(r.id);
        return {
          ...r,
          media_url: signOne(urlMap, r.media_url),
          provider: pmap.get(r.user_id) ?? null,
          rating: st ? Math.round((st.sum / st.count) * 10) / 10 : null,
          review_count: st?.count ?? 0,
          mine: auth ? r.user_id === auth.userId : false,
        };
      }),
      authed: Boolean(auth),
    };
  });

export const listServiceReviews = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ service_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    const { data: rows, error } = await sb
      .from("service_reviews")
      .select("id, reviewer_id, rating, comment, created_at")
      .eq("service_id", data.service_id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).map((r) => r.reviewer_id)));
    const { data: profs } = await sb
      .from("profiles")
      .select("id, name")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
    return { reviews: (rows ?? []).map((r) => ({ ...r, author: pmap.get(r.reviewer_id) ?? null })) };
  });

export const reviewService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        service_id: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("service_reviews").upsert(
      {
        service_id: data.service_id,
        reviewer_id: context.userId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
      { onConflict: "service_id,reviewer_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("services").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
