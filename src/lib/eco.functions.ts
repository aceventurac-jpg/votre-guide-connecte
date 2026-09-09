import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAnonClient, tryGetUser } from "@/lib/supabase-public.server";
import { z } from "zod";

export const createWasteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(3).max(140),
        description: z.string().trim().max(1000).optional().nullable(),
        city: z.string().trim().max(80).optional().nullable(),
        place: z.string().trim().max(160).optional().nullable(),
        event_date: z.string().trim().max(40).optional().nullable(),
        media: z.object({ type: z.enum(["image", "video"]), path: z.string().min(1).max(400) }).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { media, ...ev } = data;
    const { error, data: row } = await context.supabase
      .from("waste_events")
      .insert({
        ...ev,
        event_date: ev.event_date ? new Date(ev.event_date).toISOString() : null,
        user_id: context.userId,
        media_url: media?.path ?? null,
        media_type: media?.type ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // The organiser is the first participant.
    await context.supabase.from("waste_event_participants").insert({ event_id: row.id, user_id: context.userId });

    // Automatic 24 h story announcing the action.
    await context.supabase.from("stories").insert({
      user_id: context.userId,
      category: "services_locaux",
      content: `♻️ ${ev.title}${ev.city ? ` — ${ev.city}` : ""}${ev.place ? ` · ${ev.place}` : ""}`,
      visibility: "public",
      allowed_user_ids: [],
      media_url: media?.path ?? null,
      media_type: media?.type ?? null,
      link_url: "/eco",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return { id: row.id };
  });

export const listWasteEvents = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ city: z.string().trim().max(80).optional() }).optional().parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    let q = sb
      .from("waste_events")
      .select("id, user_id, title, description, city, place, event_date, media_url, media_type, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    if (data?.city) q = q.ilike("city", `%${data.city}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id);
    const safeIds = ids.length ? ids : ["00000000-0000-0000-0000-000000000000"];
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const safeUsers = userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"];

    const [{ data: profs }, { data: parts }] = await Promise.all([
      sb.from("profiles").select("id, name, avatar_url").in("id", safeUsers),
      sb.from("waste_event_participants").select("event_id, user_id").in("event_id", safeIds),
    ]);

    const { signPaths, signOne } = await import("@/lib/media.server");
    const urlMap = await signPaths([
      ...(rows ?? []).map((r) => r.media_url ?? ""),
      ...(profs ?? []).map((p) => p.avatar_url ?? ""),
    ]);
    const pmap = new Map((profs ?? []).map((p) => [p.id, { ...p, avatar_url: signOne(urlMap, p.avatar_url) }]));

    const counts = new Map<string, number>();
    const joined = new Set<string>();
    (parts ?? []).forEach((p) => {
      counts.set(p.event_id, (counts.get(p.event_id) ?? 0) + 1);
      if (auth && p.user_id === auth.userId) joined.add(p.event_id);
    });

    return {
      events: (rows ?? []).map((r) => ({
        ...r,
        media_url: signOne(urlMap, r.media_url),
        organiser: pmap.get(r.user_id) ?? null,
        participants: counts.get(r.id) ?? 0,
        joined: joined.has(r.id),
        mine: auth ? r.user_id === auth.userId : false,
      })),
      authed: Boolean(auth),
    };
  });

export const toggleParticipation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ event_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("waste_event_participants")
      .select("id")
      .eq("event_id", data.event_id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase.from("waste_event_participants").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { joined: false };
    }
    const { error } = await context.supabase
      .from("waste_event_participants")
      .insert({ event_id: data.event_id, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { joined: true };
  });

export const deleteWasteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("waste_events")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
